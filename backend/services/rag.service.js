const axios = require('axios');
const prisma = require('../config/db');

/**
 * Split text into chunks with sliding overlap.
 * @param {string} text - The raw document text.
 * @param {number} chunkSize - Character size of each chunk.
 * @param {number} overlap - Overlapping characters between adjacent chunks.
 */
const chunkDocument = (text, chunkSize = 800, overlap = 120) => {
  if (!text || typeof text !== 'string') return [];
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let startIndex = 0;

  while (startIndex < normalized.length) {
    let endIndex = startIndex + chunkSize;
    
    // Attempt to end chunk at a word boundary
    if (endIndex < normalized.length) {
      const boundaryIndex = normalized.lastIndexOf(' ', endIndex);
      if (boundaryIndex > startIndex + (chunkSize * 0.75)) {
        endIndex = boundaryIndex;
      }
    }

    const chunk = normalized.substring(startIndex, endIndex).trim();
    if (chunk.length > 30) { // Discard tiny noise fragments
      chunks.push(chunk);
    }
    
    startIndex = endIndex - overlap;
    if (startIndex >= normalized.length || endIndex >= normalized.length) {
      break;
    }
  }

  return chunks;
};

/**
 * Attempts to retrieve an embedding vector for a text string using x.ai Embeddings API.
 * Mapped to standard OpenAI embedding routes.
 */
const getEmbedding = async (text) => {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || apiKey === 'your-grok-api-key' || apiKey.trim() === '') {
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/embeddings',
      {
        model: 'v1-embedding', // Standard x.ai embedding model
        input: text
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data.data[0].embedding;
  } catch (error) {
    console.warn('Grok Embedding endpoint failed or unsupported. RAG falling back to keyword similarity.', error.message);
    return null;
  }
};

/**
 * In-memory fallback: Calculate simple word TF similarity score between two texts.
 * Helps rank chunks semantically when embeddings are unavailable.
 */
const calculateWordSimilarity = (textA, textB) => {
  const cleanTokens = (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // Filter small stopwords / noise
  };

  const tokensA = cleanTokens(textA);
  const tokensB = cleanTokens(textB);
  
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  // Compute term frequencies
  const tfA = {};
  const tfB = {};
  tokensA.forEach(t => tfA[t] = (tfA[t] || 0) + 1);
  tokensB.forEach(t => tfB[t] = (tfB[t] || 0) + 1);

  // Dot product
  let dotProduct = 0;
  Object.keys(tfA).forEach(t => {
    if (tfB[t]) {
      dotProduct += tfA[t] * tfB[t];
    }
  });

  // Magnitudes
  const magA = Math.sqrt(Object.values(tfA).reduce((sum, v) => sum + (v * v), 0));
  const magB = Math.sqrt(Object.values(tfB).reduce((sum, v) => sum + (v * v), 0));

  return dotProduct / (magA * magB);
};

/**
 * Calculates standard cosine similarity between two float vectors.
 */
const calculateVectorSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let sqSumA = 0;
  let sqSumB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    sqSumA += vecA[i] * vecA[i];
    sqSumB += vecB[i] * vecB[i];
  }
  
  const magA = Math.sqrt(sqSumA);
  const magB = Math.sqrt(sqSumB);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
};

/**
 * Search company chunks for the top K matching blocks.
 */
const retrieveRelevantChunks = async (companyId, queryText, topK = 4) => {
  try {
    // 1. Fetch chunks for the company from the DB
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          companyId: companyId
        }
      },
      include: {
        document: true
      }
    });

    if (chunks.length === 0) {
      return [];
    }

    // 2. Fetch query embedding
    const queryVector = await getEmbedding(queryText);
    
    let scoredChunks = [];

    if (queryVector) {
      // Vector-based similarity search
      scoredChunks = chunks.map(chunk => {
        let similarity = 0;
        if (chunk.embedding && Array.isArray(chunk.embedding)) {
          similarity = calculateVectorSimilarity(queryVector, chunk.embedding);
        } else if (chunk.embedding && typeof chunk.embedding === 'string') {
          try {
            const parsed = JSON.parse(chunk.embedding);
            similarity = calculateVectorSimilarity(queryVector, parsed);
          } catch (e) {
            similarity = calculateWordSimilarity(chunk.content, queryText);
          }
        } else {
          similarity = calculateWordSimilarity(chunk.content, queryText);
        }
        return { ...chunk, score: similarity };
      });
    } else {
      // Keyword fallback similarity search
      scoredChunks = chunks.map(chunk => {
        const similarity = calculateWordSimilarity(chunk.content, queryText);
        return { ...chunk, score: similarity };
      });
    }

    // Sort by descending score and take topK
    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK).filter(c => c.score > 0.05); // Filter out zero alignments
  } catch (error) {
    console.error('RAG Retrieval Service Failure:', error);
    return [];
  }
};

module.exports = {
  chunkDocument,
  getEmbedding,
  retrieveRelevantChunks
};
