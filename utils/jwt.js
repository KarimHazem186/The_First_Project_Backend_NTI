const jwt =require('jsonwebtoken')


function generateAccessToken(userId){
    const payload={
        userId
    };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const options = {expiresIn:"15m"}

    return jwt.sign(payload,secretKey,options);
}

function generateRefreshToken(userId){
    const payload = {
        userId
    };
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    const options = {expiresIn:"7d"}
    return jwt.sign(payload,secretKey,options);
}


module.exports ={
    generateAccessToken,
    generateRefreshToken
}
