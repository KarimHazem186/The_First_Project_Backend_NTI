const appError = require("../utils/appError");

function authorizeRole(requiredRole){
    return(req,res,next)=>{
        if(req.user.role!==requiredRole){
            // return next(AppError.create('Access denied: Admins only', 403));
            throw appError.create('Access denied', 403);
        }
       next();
    }
}


module.exports={authorizeRole}

