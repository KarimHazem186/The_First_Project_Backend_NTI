const { body } = require('express-validator');
const capitalizeFirst=(value)=>{
    return value.charAt(0).toUpperCase()+value.slice(1)
}

const validateProfileUpdate = [
  body('name')
    .optional()
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .isString()
    .trim()
    .customSanitizer(value => {
        if (typeof value !== 'string') return value;
        return value.trim().toLowerCase().replace(/\s+/g, '_');
    })
   
    .customSanitizer(value => {
        const clean = value.replace(/[^a-zA-Z\s]/g, '').trim()
        return clean.charAt(0).toUpperCase() + clean.slice(1)
    })

    .customSanitizer(capitalizeFirst)

    .isLength({ min: 2 })
    .withMessage("Name too short"),
  
];


module.exports =validateProfileUpdate