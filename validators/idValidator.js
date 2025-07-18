const { param } = require('express-validator');

const idValidator = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID'),
];

module.exports = idValidator;
