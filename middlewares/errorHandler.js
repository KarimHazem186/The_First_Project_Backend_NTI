// global Error handler delete id not found
const logger = require('../utils/loggers');
const httpStatusText = require('../utils/httpStatusText')
module.exports=((error,req,res,next)=>{
    logger.error(error.message, { stack: error.stack });
    // logger.error(`❌ ${error.message}`, { stack: error.stack });
    res.status(error.statusCode||500).json({
        status:error.statusText ||
        httpStatusText.ERROR || 'error' ,
        message:error.message || 'Something went wrong',
        code:error.statusCode||500,
        errors:error.errors || null,
        data:null
    })
})





