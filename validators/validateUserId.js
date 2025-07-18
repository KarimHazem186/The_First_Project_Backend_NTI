const { check } = require('express-validator');
const mongoose = require('mongoose');
const appError = require('../utils/appError');

const validateUserId = [
  check('user')
    .custom((value, { req }) => {
      if (!req.user || !mongoose.Types.ObjectId.isValid(req.user.userId)) {
        // throw new Error('Invalid or missing user ID');
        throw appError.create('Invalid or Not authenticate',401)
      }
      return true;
    })
];

module.exports = validateUserId;
