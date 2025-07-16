const {validationResult} = require('express-validator');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText')
// const catchAsync = require('../utils/catchAsync');

const validateRequest = (req,_res,next)=>{
    const result = validationResult(req);

    if(typeof result.array !='function'){
        return next(appError.create('express-validator mis-configured',500))
    }

    const errorsArr = result.array({onlyFirstError:true})

    if(errorsArr.length) {
        const formattedError = errorsArr.map(err => ({
            field: err.param,
            message: err.msg,
        }));

        return next(
            appError.create("Validation Failed",400,httpStatusText.FAIL ||'fail',formattedError)
        )
    }
    next();
}


module.exports = validateRequest;
