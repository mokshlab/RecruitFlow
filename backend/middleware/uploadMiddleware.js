// backend/middleware/uploadMiddleware.js
// Enhanced GridFS file upload middleware with proper size limits

const multer = require('multer');
const path = require('path');
const { getGridFSBucket } = require('../config/gridfs');
const logger = require('../config/logger');
const constants = require('../config/constants');

/**
 * Multer memory storage - files stored in memory temporarily
 */
const storage = multer.memoryStorage();

/**
 * File filter with strict validation
 */
const fileFilter = (req, file, cb) => {
  const isResume = file.fieldname === 'resume';
  const isProfilePhoto = file.fieldname === 'profilePhoto';

  // Validate field name
  if (!isResume && !isProfilePhoto) {
    logger.warn(`Invalid file field: ${file.fieldname}`);
    return cb(new Error('Invalid file field name'), false);
  }

  // Validate mime type
  const allowedTypes = isResume 
    ? constants.ALLOWED_RESUME_TYPES 
    : constants.ALLOWED_IMAGE_TYPES;

  if (!allowedTypes.includes(file.mimetype)) {
    const expectedTypes = isResume ? 'PDF, DOC, DOCX' : 'JPG, PNG';
    logger.warn(`Invalid file type: ${file.mimetype} for ${file.fieldname}`);
    return cb(new Error(`Only ${expectedTypes} files are allowed for ${file.fieldname}`), false);
  }

  // Validate file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const validExtensions = isResume 
    ? ['.pdf', '.doc', '.docx'] 
    : ['.jpg', '.jpeg', '.png'];

  if (!validExtensions.includes(ext)) {
    logger.warn(`Invalid file extension: ${ext} for ${file.fieldname}`);
    return cb(new Error(`Invalid file extension: ${ext}`), false);
  }

  cb(null, true);
};

/**
 * Initialize multer with memory storage and file size limits
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: constants.MAX_FILE_SIZE,
    files: 2, // Max 2 files per request (profile photo + resume)
  },
  fileFilter: fileFilter
});

/**
 * Upload file to GridFS with enhanced error handling and size enforcement
 * Returns a promise that resolves with file ID and URL
 */
const uploadToGridFS = (file, fieldname) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      
      if (!bucket) {
        return reject(new Error('GridFS bucket not initialized. MongoDB connection may not be ready.'));
      }
      
      // Enforce file size limits
      const maxSize = fieldname === 'resume' 
        ? constants.MAX_RESUME_SIZE 
        : constants.MAX_PROFILE_PHOTO_SIZE;
        
      if (file.size > maxSize) {
        logger.warn(`File size limit exceeded: ${file.size} > ${maxSize}`);
        return reject(new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`));
      }

      // Validate magic bytes (file signature) to prevent MIME spoofing
      const signature = constants.FILE_SIGNATURES[file.mimetype];
      if (signature) {
        const actualBytes = Array.from(file.buffer.slice(0, signature.length));
        const signatureMatch = signature.every((byte, i) => actualBytes[i] === byte);
        if (!signatureMatch) {
          logger.warn(`Magic bytes mismatch for ${file.mimetype}: ${actualBytes.map(b => `0x${b.toString(16).toUpperCase()}`).join(', ')}`);
          return reject(new Error('File content does not match declared file type'));
        }
      }

      const filename = `${fieldname}-${Date.now()}${path.extname(file.originalname)}`;
      
      logger.info(`Uploading to GridFS: ${filename} (${(file.size / 1024).toFixed(2)} KB)`);
      
      // Create upload stream
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          fieldname: fieldname,
          uploadedAt: new Date(),
          size: file.size
        }
      });

      // Handle upload completion
      uploadStream.on('finish', () => {
        logger.info(`GridFS upload complete: ${filename} (ID: ${uploadStream.id})`);
        resolve({
          fileId: uploadStream.id,
          filename: filename,
          url: `/api/files/${uploadStream.id}`
        });
      });

      // Handle errors
      uploadStream.on('error', (error) => {
        logger.error(`GridFS upload error for ${filename}:`, error);
        reject(error);
      });

      // Write buffer to stream
      uploadStream.end(file.buffer);
    } catch (error) {
      logger.error('Error in uploadToGridFS:', error);
      reject(error);
    }
  });
};

module.exports = {
  upload,
  uploadToGridFS
};
