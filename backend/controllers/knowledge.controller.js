const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const prisma = require('../config/db');
const { chunkDocument, getEmbedding } = require('../services/rag.service');
const { logAction } = require('../services/audit.service');

exports.uploadDocument = async (req, res) => {
  try {
    const { title } = req.body;
    const { companyId, id: userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF or text file.' });
    }

    const docTitle = title || req.file.originalname;
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // 1. Create KnowledgeDocument in database (state: processing)
    const document = await prisma.knowledgeDocument.create({
      data: {
        companyId,
        title: docTitle,
        fileUrl: `/uploads/${req.file.filename}`,
        status: 'processing'
      }
    });

    // Run text extraction and vectorization asynchronously so HTTP request returns quickly
    // (Preserving user experience, especially on larger PDFs)
    processDocumentAsync(document.id, filePath, mimeType, companyId, userId, docTitle)
      .catch(err => console.error('Asynchronous Document Ingestion Failure:', err));

    res.status(202).json({
      message: 'Document uploaded successfully. Parsing and vector indexing are running in the background.',
      document
    });
  } catch (error) {
    console.error('Upload Document Error:', error);
    res.status(500).json({ error: 'Failed to upload and queue document processing.' });
  }
};

/**
 * Lists all documents in the company knowledge base.
 */
exports.getDocuments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const documents = await prisma.knowledgeDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Get Documents Error:', error);
    res.status(500).json({ error: 'Failed to retrieve company documents.' });
  }
};

/**
 * Deletes a document and all its chunks.
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const doc = await prisma.knowledgeDocument.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (doc.companyId !== companyId) {
      return res.status(403).json({ error: 'Access denied. Tenant mismatch.' });
    }

    // Delete chunks (handled automatically by Cascade onDelete, but let's delete explicitly or let Prisma handle)
    await prisma.knowledgeDocument.delete({
      where: { id }
    });

    // Delete local file if it exists
    if (doc.fileUrl) {
      const fullPath = path.join(__dirname, '..', doc.fileUrl);
      fs.unlink(fullPath, (err) => {
        if (err) console.log('File cleanup omitted or missing:', err.message);
      });
    }

    // Track Audit Log
    await logAction({
      companyId,
      userId,
      action: 'DELETE_KNOWLEDGE_DOCUMENT',
      entity: `Document: ${doc.title}`
    });

    res.status(200).json({ message: 'Document and its search indexes deleted successfully.' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge base document.' });
  }
};

/**
 * Background runner that extracts text, chunks it, calls Grok Embeddings, and inserts chunks.
 */
const processDocumentAsync = async (documentId, filePath, mimeType, companyId, userId, title) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    let rawText = '';

    // 1. Text Extraction
    if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
      const parsedPdf = await pdf(dataBuffer);
      rawText = parsedPdf.text;
    } else {
      rawText = dataBuffer.toString('utf-8');
    }

    if (!rawText || rawText.trim() === '') {
      throw new Error('Extracted document content is empty.');
    }

    // 2. Chunking
    const textChunks = chunkDocument(rawText, 800, 120);

    // 3. Vectorization & Database Write
    for (const chunk of textChunks) {
      const vector = await getEmbedding(chunk);

      await prisma.documentChunk.create({
        data: {
          documentId,
          content: chunk,
          embedding: vector ? JSON.stringify(vector) : null // Store vector as JSON
        }
      });
    }

    // 4. Update status to Ready
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'ready' }
    });

    // Log Audit Trail
    await logAction({
      companyId,
      userId,
      action: 'CREATE_KNOWLEDGE_DOCUMENT',
      entity: `Document: ${title}`,
      details: { chunksCount: textChunks.length }
    });

    console.log(`🚀 RAG Intake Success for Document ID ${documentId}: ${textChunks.length} chunks indexed.`);
  } catch (error) {
    console.error(`Document processing failed for ID ${documentId}:`, error.message);
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'failed' }
    });
  }
};
