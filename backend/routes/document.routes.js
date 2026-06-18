const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/document.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Set up storage directory for documents
const baseUploadDir = process.env.STORAGE_PATH || path.join(__dirname, '..', 'uploads');
const storagePath = path.join(baseUploadDir, 'documents');
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
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

router.post('/', authMiddleware, upload.single('file'), documentController.uploadDocument);
router.get('/', authMiddleware, documentController.getDocuments);
router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;
