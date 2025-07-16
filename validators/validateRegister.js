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
      
      .customSanitizer(value => value.trim().toLowerCase().replace(/\s+/g, '_'))
      
      .customSanitizer(value => {
        const clean = value.replace(/[^a-zA-Z\s]/g, '').trim()
        return clean.charAt(0).toUpperCase() + clean.slice(1)
      })

      // .trim()
      .customSanitizer(capitalizeFirst),


    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .customSanitizer(value => value.toLowerCase().trim())
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
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      
      .customSanitizer(value => value.trim())
      
      .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must contain a number and a special character')

      
      .custom(value => {
        if (!hasSymbol(value)) {
          throw new Error('Password must include at least one symbol (!@#$...)');
        }
        return true;
      }),

    body('role')
      .customSanitizer(value => value.trim().toLowerCase())
      .isIn([userRoles.ADMIN, userRoles.USER]).withMessage('Invalid role'),
    

//    body('profileImg')
//     .notEmpty().withMessage('Profile image is required')
//     .customSanitizer(value => value.trim())
//     .custom(value => {
//       const isUrl = /^(https?:\/\/)[\w.-]+\.[\w]{2,}(\/[\w.-]*)*\.(jpg|jpeg|png|gif|webp)$/i.test(value);
//       const isFilename = /^[\w,\s-]+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
//       if (!isUrl && !isFilename) {
//         throw appError.create('Profile image must be a valid image URL or file name (jpg, png, etc.)',400,'fail');
//       }
//       return true;
//     })
  
    ];
}


module.exports=validateRegister

