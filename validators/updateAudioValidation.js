const { body } = require('express-validator');

const updateAudioValidation = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('genre').optional().isString().withMessage('Genre must be a string'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true/false'),
];

module.exports = { updateAudioValidation };
