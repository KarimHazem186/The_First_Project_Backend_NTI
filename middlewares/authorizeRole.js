function authorizeRole(requiredRole){
    return(req,res,next)=>{
        if(req.user.role!==requiredRole){
            // return next(AppError.create('Access denied: Admins only', 403));
            throw AppError.create('Access denied: Admins only', 403);
        }
       next();
    }
}


module.exports={authorizeRole}

