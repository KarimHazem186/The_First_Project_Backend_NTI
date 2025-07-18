const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

function authenticate(req,res,next){
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        throw appError.create('Not authorized',401,httpStatusText.FAIL)
    }
    
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,data)=>{
        if(err) {
            // return res.status(403).json({message:"Invalid or expired Login"})
            throw appError.create('Invalid or expired Login',403)
        }
        req.user =data;
        next()

    })
}

module.exports={authenticate}