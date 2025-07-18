const multer = require("multer");
const path = require("path");
const fs = require("fs");
const appError = require('../../utils/appError');

// Supported file types and limits
const fileTypeMap = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  cover: {
    types: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    maxSize: 3 * 1024 * 1024 // 3MB
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

// Flatten all MIME types
const allMimeTypes = [
  ...fileTypeMap.image.types,
  ...fileTypeMap.cover.types,
  ...fileTypeMap.audio.types,
  ...fileTypeMap.video.types
];

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const mime = file.mimetype;
    const fieldName = file.fieldname;
    const userId = req.user?.userId?.toString() || "anonymous";

    let subFolder = "others";

    if (fieldName === "profileImg" &&fileTypeMap.image.types.includes(mime)) {
      subFolder = `images/user_${userId}`;
    } else if (fieldName === "cover" &&fileTypeMap.cover.types.includes(mime)) {
      subFolder = `covers/user_${userId}`;
    } else if (fieldName === "audio" &&fileTypeMap.audio.types.includes(mime)) {
      subFolder = `audio/user_${userId}`;
    } else if (fieldName === "video" &&fileTypeMap.video.types.includes(mime)) {
      subFolder = `videos/user_${userId}`;
    } else {
      return cb(appError.create('❌ Unsupported file type', 400));
    }

    const folderPath = path.join("uploads", subFolder);
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = function (req, file, cb) {
  const mime = file.mimetype;

  if (allMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(appError.create("❌ File type not allowed", 400), false);
  }
};

// Set limits dynamically (default 2MB fallback)
const limits = {
  fileSize: function (req, file, cb) {
    const mime = file.mimetype;

    if (fileTypeMap.image.types.includes(mime)) return cb(null, fileTypeMap.image.maxSize);
    if (fileTypeMap.cover.types.includes(mime)) return cb(null, fileTypeMap.cover.maxSize);
    if (fileTypeMap.audio.types.includes(mime)) return cb(null, fileTypeMap.audio.maxSize);
    if (fileTypeMap.video.types.includes(mime)) return cb(null, fileTypeMap.video.maxSize);

    return cb(null, 2 * 1024 * 1024); // fallback to 2MB
  }
};

// Init multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Global max for any single file
  }
});

module.exports = upload;



// const multer = require('multer');
// const path = require('path');
// const appError = require('../utils/appError');

// // File type map and max size (in bytes)
// const fileTypeMap = {
//   image: {
//     types: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
//     maxSize: 5 * 1024 * 1024 // 5MB
//   },
//   audio: {
//     types: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
//     maxSize: 10 * 1024 * 1024 // 10MB
//   },
//   video: {
//     types: ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg'],
//     maxSize: 50 * 1024 * 1024 // 50MB
//   }
// };

// // Flatten all MIME types for easy lookup
// const allMimeTypes = [
//   ...fileTypeMap.image.types,
//   ...fileTypeMap.audio.types,
//   ...fileTypeMap.video.types
// ];

// /**
//  * @param {Object} options
//  * @param {string[]} options.types - Allowed types (e.g. ['image', 'audio'])
//  * @param {string} options.fieldName - Field name in form (e.g. 'profileImg')
//  * @param {number} [options.maxSizeMB=20] - Max size in MB
//  */

// // Dynamic destination
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const mime = file.mimetype;

    // if (fileTypeMap.image.types.includes(mime)) {
    //   cb(null, 'uploads/images');
    // } else if (fileTypeMap.audio.types.includes(mime)) {
    //   cb(null, 'uploads/audio');
    // } else if (fileTypeMap.video.types.includes(mime)) {
    //   cb(null, 'uploads/video');
    // } else {
    //   cb(appError.create('Unsupported file type', 400, 'fail'));
    // }
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
//     cb(null, `${name}-${Date.now()}${ext}`);
//   }
// });

// // Custom file filter with manual size check
// const fileFilter = (req, file, cb) => {
//   const mime = file.mimetype;

//   // Not allowed?
//   if (!allMimeTypes.includes(mime)) {
//     return cb(appError.create('Only image, audio, or video files are allowed', 400, 'fail'));
//   }

//   // Check file size manually using req.headers['content-length']
//   const contentLength = parseInt(req.headers['content-length'] || '0');

//   const limitMap = Object.values(fileTypeMap).find(ft => ft.types.includes(mime));

//   if (limitMap && contentLength > limitMap.maxSize) {
//     return cb(appError.create(`File size exceeds limit for ${mime} (max ${limitMap.maxSize / (1024 * 1024)}MB)`, 400, 'fail'));
//   }

//   cb(null, true);
// };

// // Use large general limit, rely on manual filter for specifics
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024 // Upper bound to allow all types
//   }
// });

// module.exports = upload;
