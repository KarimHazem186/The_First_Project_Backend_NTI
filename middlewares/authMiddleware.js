const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');

function authenticate(req,res,next){
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        throw appError.create('Token missing',401,'fail')
    }
    
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,data)=>{
        if(err) {
            return res.status(403).json({message:"Invalid or expired token"})
        }
        req.user =data;
        next()

    })
}

module.exports=authenticate