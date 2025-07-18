const { body } = require('express-validator');

const createAudioValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters')
    .matches(/^[\w\s\-.,!?()]+$/).withMessage('Title contains invalid characters'),

  body('genre')
    .notEmpty().withMessage('Genre is required')
    .isIn(['education', 'religion', 'comedy', 'fiction', 'self-help'])
    .withMessage('Genre must be one of: education, religion, comedy, fiction, self-help'),

  // Optional boolean for isPrivate
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true or false'),
];

module.exports = {createAudioValidation}
