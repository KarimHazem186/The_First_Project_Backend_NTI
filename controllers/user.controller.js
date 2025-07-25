const User = require("../models/user.model");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {generateRefreshToken, generateAccessToken} = require("../utils/jwt");
const appError = require("../utils/appError");
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require("../middlewares/asyncWrapper");
const validateMongoDbId = require('../utils/validateMongoDbId');

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
    const newAccessToken = generateAccessToken(user);
    res.cookie('accessToken',newAccessToken,{httpOnly:true,maxAge: 1000 * 60* 60,secure:true,signed:true});
    res.status(200).json({
        status : httpStatusText.SUCCESS,
        accessToken:newAccessToken
    })  
})



const signup= asyncWrapper(async(req,res)=>{
    const {name,email,password,role}=req.body;
    const profileImg = req.file?.filename; // from multer
    console.log(req.file)
    if( !name || !email || !password || !profileImg ){
        throw appError.create('Please fill in all fields',400)
    }
    
    const existingUser  = await User.findOne({email});
    if(existingUser){
        throw appError.create('Email already exists',400)
    }
    
    // const hashedPassword = await bcrypt.hash(password,10);
    // const newUser = await User.create({name,email,password:hashedPassword,role,profileImg});
    
    const newUser = await User.create({name,email,password,role,profileImg});
    
    // const accessToken = generateAccessToken(newUser._id);
    // const refreshToken = generateRefreshToken(newUser._id)

    // newUser.refreshToken = refreshToken;
    // await newUser.save();

    // res.cookie('refreshToken',refreshToken,{
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'Lax',
    //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    // })

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${profileImg}`;

    res.status(201).json({
        status : httpStatusText.SUCCESS,
        message:"User Created Successfully",
        // accessToken,
        // imageUrl,
        user: {
            id: newUser._id,
            // name:user.name,
            // email:user.email
        }
    })
})




const login =asyncWrapper(async(req,res)=>{
    const {email,password} = req.body;
    if(!email||!password) {
        throw appError.create('Fields are required',400)
    } 

    const user = await User.findOne({email}).select("+password");
    if(!user) throw appError.create("Invalid credentials",401)
    
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) throw appError.create('Invalid credentials',401)

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken;
    await user.save()

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })


    res.status(200).json({
        status : httpStatusText.SUCCESS,
        message:"User Login Successfully",
        accessToken,
        user: {
            id: user._id,
            // name:user.name,
            // email:user.email
        }
    });           
})


const getProfile = asyncWrapper(async (req, res) => {
  const id = req.user.userId;
  validateMongoDbId(id);

  const user = await User.findById(id);
  if (!user) throw appError.create("User not found", 404);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Your profile info:",
    user: {
      name: user.name,
      email: user.email,
      profileImage: user.profileImg,
    },
  });
});


// const updateProfile = asyncWrapper(async(req,res)=>{
//     const id = req.user.userId;
//     validateMongoDbId(id);
//     const user = await User.findById(id);
//     if (!user) throw appError.create("User not found", 404);

//     const {name} =req.body;

//     if(!name && !req.file) {
//         throw appError.create("Please provide name or profile image to update", 400);
//     }

//     // Update name if provided
//     if (name) user.name = name;

//     // Update profile image if uploaded
//     if (req.file) {
//         user.profileImg = req.file?.filename; // or req.file.path if storing full path
//     }

//     await user.save();

//     res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         message: "Profile updated successfully",
//         user: {
//             name: user.name,
//             // email: user.email,
//             profileImage: user.profileImg,
//         },
//   });

// })


// const followUser =asyncWrapper(async(req,res)=>{
//   const {userId} = req.params;
//   const currentUser = await User.findById(req.user.userId);
  
//   if (currentUser.following.includes(userId)) {
//     throw appError.create('You already follow this user.',400,httpStatusText.FAIL)
//   }
//   currentUser.following.push(userId);
//   await currentUser.save();

//   // await User.findByIdAndUpdate(userId,{$inc:{followers:1}});

//    await User.findByIdAndUpdate(userId, { $push: { followers: req.userId } });
//     res.status(200).json({
//       success: httpStatusText.SUCCESS,
//       message: 'You are now following this user.',
//     });
// })

// ORRRRRRRRRRRRRRRRRRRRRRRRRRRRRR

const updateProfile = asyncWrapper(async(req,res)=>{
    const userId = req.user.userId;
    const {name,email,profileImg} = req.body

    const user = await User.findById(userId);
    if(!user){
        throw appError.create('User not found',404,httpStatusText.FAIL)
    }

    if(name&&name!==user.name){
        user.editHistory.push({
            field:'name',
            oldValue:user.name,
            newValue:name.toLowerCase(),
            changedAt: new Date()
        });
        user.name=name
    }
    if(email&&email!==user.email){
        user.editHistory.push({
            field:'email',
            oldValue:user.email,
            newValue:email.toLowerCase(),
            changedAt: new Date()
        });
        user.email=email
    }
    if(profileImg&&profileImg!==user.profileImg){
        user.editHistory.push({
            field:'profileImg',
            oldValue:user.profileImg,
            newValue:profileImg,
            changedAt: new Date()
        });
        user.profileImg=profileImg
    }
    await user.save();
    res.status(200).json({
        success:httpStatusText.SUCCESS,
        message:'Profile updated successfully',
        user
    });
})


const getEditHistory = asyncWrapper(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select('editHistory name');
  if (!user) {
    throw appError.create('User not found', 404, httpStatusText.FAIL);
  }

  res.status(200).json({
    success: httpStatusText.SUCCESS,
    user: user.name,
    count: user.editHistory.length,
    history: user.editHistory
  });
});


const followUser =asyncWrapper(async(req,res)=>{
  const currentUserId = req.user.userId;
  const targetUserId = req.params.id;

  console.log(currentUserId," ",targetUserId)

  if(currentUserId===targetUserId){
    throw appError.create('You cannot follow yourself.',400,httpStatusText.FAIL)
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if(!targetUser){
    throw appError.create('User not found.',400,httpStatusText.FAIL)
  }

  if(currentUser.following.includes(targetUserId)){
    throw appError.create('You already follow this user.',400,httpStatusText.FAIL)
  }

// Add user to following/followers array
//   await User.findByIdAndUpdate(currentUserId,{$push:{following:targetUserId}});
//   await User.findByIdAndUpdate(targetUserId,{$push:{followers:targetUserId}});

  /// ORRRRRRRRRR

// Add user to following/followers array
 currentUser.following.push(targetUserId);
 targetUser.followers.push(currentUserId);


  await currentUser.save();
  await targetUser.save();

// Increment counters
//   await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });
//   await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });


  res.status(200).json({
    success: httpStatusText.SUCCESS,
    message: 'You are now following this user.',
  })
})

// unfollow user
const unfollowUser =asyncWrapper(async(req,res)=>{
    const currentUserId = req.user.userId;
    const targetUserId = req.params.id;
    console.log(currentUserId," ",targetUserId)
    if(currentUserId===targetUserId){
        throw appError.create('You cannot unfollow yourself.',400,httpStatusText.FAIL)
    }
    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(targetUserId)

    if(!targetUser){
        throw appError.create('User not found.',400,httpStatusText.FAIL)
    }

    // currentUser.following = currentUser.following.filter(id => id !== targetUserId);
    // targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);

   currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
   targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

  // Decrement counters
//   await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
//   await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });


    res.status(200).json({ message: 'User unfollowed successfully.'});


})


// get followers
const getFollowers = asyncWrapper(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('followers','name email')
    if(!user){
        throw appError.create('User not found.',400,httpStatusText.FAIL)
    }

    const isSelf = req.user?.userId === userId;

    res.status(200).json( { success: httpStatusText.SUCCESS,count:user.followers.length , message: isSelf ? 'Your followers:' : 'User followers:',followers:user.followers});
})

// get following
const getFollowing = asyncWrapper(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('following','name email')
    if(!user){
        throw appError.create('User not found.',400,httpStatusText.FAIL)
    }
    
    const isSelf = req.user?.userId === userId;


    res.status(200).json( { success: httpStatusText.SUCCESS,count:user.following.length,message: isSelf ? 'People you follow:' : 'User following:',following:user.following });
})



module.exports={
    refreshToken,
    signup,
    login,
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getEditHistory,
}
