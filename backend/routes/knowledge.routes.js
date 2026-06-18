const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const knowledgeController = require('../controllers/knowledge.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Set up storage directory for knowledge base documents
const baseUploadDir = process.env.STORAGE_PATH || path.join(__dirname, '..', 'uploads');
const storagePath = path.join(baseUploadDir, 'knowledge');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT documents are supported.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', authMiddleware, upload.single('file'), knowledgeController.uploadDocument);
router.get('/', authMiddleware, knowledgeController.getDocuments);
router.delete('/:id', authMiddleware, knowledgeController.deleteDocument);

module.exports = router;
