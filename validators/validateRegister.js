const {body,validationResult} = require('express-validator');

const User =require('../models/user.model')

const appError = require('../utils/appError');
const userRoles = require('../utils/role');

const capitalizeFirst=(value)=>{
    return value.charAt(0).toUpperCase()+value.slice(1)
}

const hasSymbol = (value)=>/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value)


const validateRegister = ()=>{
  return  [
    body('name')
      .notEmpty().escape().withMessage('name is required')
    //   .isAlphanumeric().withMessage('name must be alphanumeric')
      .isLength({ min: 2, max: 50 }).withMessage('name must be 2-50 characters')
      
      .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
      
      .customSanitizer(value => {
        if (typeof value !== 'string') return value;
        return value.trim().toLowerCase().replace(/\s+/g, '_');
      })

      // .customSanitizer(value => value.trim().toLowerCase().replace(/\s+/g, '_'))
      
      .customSanitizer(value => {
        const clean = value.replace(/[^a-zA-Z\s]/g, '').trim()
        return clean.charAt(0).toUpperCase() + clean.slice(1)
      })

      // .trim()
      .customSanitizer(capitalizeFirst),


    body('email')
      .notEmpty().escape().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      // .customSanitizer(value => value.toLowerCase().trim())
      .customSanitizer(value => {
        if (typeof value !== 'string') return value;
        return value.trim();
      })
      .normalizeEmail()
      // .trim()
      .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          // throw new Error('Email already in use');
          throw appError.create('Email already in use');
        }
        return true;
      }),


      // Password
    body('password')
      .notEmpty().escape().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      
      // .customSanitizer(value => value.trim())
      
      .customSanitizer(value => {
        if (typeof value !== 'string') return value;
        return value.trim();
      })

      .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must contain a number and a special character')

      
      .custom(value => {
        if (!hasSymbol(value)) {
          throw new Error('Password must include at least one symbol (!@#$...)');
        }
        return true;
      }),

    body('role')
      .optional()
      .customSanitizer(value => value.trim().toLowerCase())
      .isIn([userRoles.ADMIN, userRoles.USER]).withMessage('Invalid role'),
      
    ];
}


module.exports=validateRegister

