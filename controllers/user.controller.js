const User = require("../models/user.model");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {generateRefreshToken, generateAccessToken} = require("../utils/jwt");
const appError = require("../utils/appError");
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require("../middlewares/asyncWrapper");

// asyncWrapper( async function refreshToken(req,res){
//     const token = req.cookies.refreshToken;
//     if(!token){
//         throw appError.create('No refresh token',401)
//     }
//     const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
//     const user = await User.findById(decoded.userId);
//     if(!user){
//         throw appError.create('User not found',404)
//     }
//     if(user.refreshToken!==token){
//         throw appError.create('Refresh token does not match',403)
//     }
//     const newAccessToken = generateAccessToken(user._id);
//     res.cookie('accessToken',newAccessToken,{httpOnly:true,maxAge: 1000 * 60* 60,secure:true,signed:true});
//     res.status(200).json({accessToken:newAccessToken})
// })

const refreshToken=asyncWrapper(async(req,res)=>{
  const token = req.cookies.refreshToken;
    if(!token){
        throw appError.create('No refresh token',401)
    }
    const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if(!user){
        throw appError.create('User not found',404)
    }
    if(user.refreshToken!==token){
        throw appError.create('Refresh token does not match',403)
    }
    const newAccessToken = generateAccessToken(user._id);
    res.cookie('accessToken',newAccessToken,{httpOnly:true,maxAge: 1000 * 60* 60,secure:true,signed:true});
    res.status(200).json({accessToken:newAccessToken})  
})



const signup= asyncWrapper(async(req,res)=>{
    const {name,email,password,role}=req.body;

    if( !name || !email || !password || !profileImg ){
        throw appError.create('Please fill in all fields',400)
    }
    const user = await User.findOne({email});
    if(user){
        throw appError.create('Email already exists',400)
    }
    // const hashedPassword = await bcrypt.hash(password,10);
    // const newUser = await User.create({name,email,password:hashedPassword,role,profileImg});
    const newUser = await User.create({name,email,password,role,profileImg});
    const token = generateAccessToken(newUser._id);
    res.status(201).json({token})
})


module.exports={
    refreshToken,
    signup,
}