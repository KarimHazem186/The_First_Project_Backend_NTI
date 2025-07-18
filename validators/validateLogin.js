const { body } = require('express-validator');

// Optional: You can still use this if you want a custom error message for symbols
const hasSymbol = (value) => /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value);

const validateLogin = () => {
  return [
    body('email')
      .notEmpty().escape().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .customSanitizer(value => {
        if (typeof value !== 'string') return value;
        return value.toLowerCase().trim();
      })
      .normalizeEmail(),

    body('password')
      .notEmpty().escape().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .customSanitizer(value => {
        if (typeof value !== 'string') return value;
        return value.trim();
      })
   
  ];
};

module.exports = validateLogin;


