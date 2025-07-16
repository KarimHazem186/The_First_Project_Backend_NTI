const multer = require('multer');
const path = require('path');
const appError = require('../utils/appError');

// File type map and max size (in bytes)
const fileTypeMap = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  audio: {
    types: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  video: {
    types: ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg'],
    maxSize: 50 * 1024 * 1024 // 50MB
  }
};

// Flatten all MIME types for easy lookup
const allMimeTypes = [
  ...fileTypeMap.image.types,
  ...fileTypeMap.audio.types,
  ...fileTypeMap.video.types
];

/**
 * @param {Object} options
 * @param {string[]} options.types - Allowed types (e.g. ['image', 'audio'])
 * @param {string} options.fieldName - Field name in form (e.g. 'profileImg')
 * @param {number} [options.maxSizeMB=20] - Max size in MB
 */

// Dynamic destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mime = file.mimetype;

    if (fileTypeMap.image.types.includes(mime)) {
      cb(null, 'uploads/images');
    } else if (fileTypeMap.audio.types.includes(mime)) {
      cb(null, 'uploads/audio');
    } else if (fileTypeMap.video.types.includes(mime)) {
      cb(null, 'uploads/video');
    } else {
      cb(appError.create('Unsupported file type', 400, 'fail'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

// Custom file filter with manual size check
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype;

  // Not allowed?
  if (!allMimeTypes.includes(mime)) {
    return cb(appError.create('Only image, audio, or video files are allowed', 400, 'fail'));
  }

  // Check file size manually using req.headers['content-length']
  const contentLength = parseInt(req.headers['content-length'] || '0');

  const limitMap = Object.values(fileTypeMap).find(ft => ft.types.includes(mime));

  if (limitMap && contentLength > limitMap.maxSize) {
    return cb(appError.create(`File size exceeds limit for ${mime} (max ${limitMap.maxSize / (1024 * 1024)}MB)`, 400, 'fail'));
  }

  cb(null, true);
};

// Use large general limit, rely on manual filter for specifics
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Upper bound to allow all types
  }
});

module.exports = upload;
