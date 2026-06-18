const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  try {
    const { title, type } = req.body;
    const { companyId, id: userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select a document file to upload.' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Document classification type is required.' });
    }

    const docTitle = title || req.file.originalname;

    const document = await prisma.document.create({
      data: {
        companyId,
        title: docTitle,
        fileUrl: `/uploads/documents/${req.file.filename}`,
        type
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'DOCUMENT_UPLOAD',
      entity: `Document: ${docTitle}`,
      details: { docType: type }
    });

    res.status(201).json({ message: 'Document archived in vault successfully.', document });
  } catch (error) {
    console.error('Document Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { type } = req.query;

    const filters = { companyId };
    if (type) {
      filters.type = type;
    }

    const documents = await prisma.document.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(documents);
  } catch (error) {
    console.error('Get Documents Error:', error);
    res.status(500).json({ error: 'Failed to retrieve document vault.' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc || doc.companyId !== companyId) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    await prisma.document.delete({ where: { id } });

    // Try deleting file locally
    const fullPath = path.join(__dirname, '..', doc.fileUrl);
    fs.unlink(fullPath, (err) => {
      if (err) console.log('Document file cleanup skipped:', err.message);
    });

    await logAction({
      companyId,
      userId,
      action: 'DOCUMENT_DELETE',
      entity: `Document: ${doc.title}`
    });

    res.status(200).json({ message: 'Document removed from vault.' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ error: 'Failed to remove document.' });
  }
};
