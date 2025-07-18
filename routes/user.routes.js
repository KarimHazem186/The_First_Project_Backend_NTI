const express = require("express");
const { refreshToken, signup,login,getProfile,updateProfile } = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/authMiddleware");
const validateRegister = require("../validators/validateRegister");
const validateLogin = require("../validators/validateLogin");
const validateUserId = require("../validators/validateUserId");
const validateRequest = require("../middlewares/validateRequest");
const upload = require("../config/multer.config/multer.uploads");
const validateProfileUpdate = require("../validators/validateProfileUpdate");
const router = express.Router();

router.post('/refresh-token',refreshToken)
router.post('/signup',upload.single('profileImg'),validateRegister(),validateRequest,signup)
router.post('/login',validateLogin(),validateRequest,login)

router.route('/profile')
  .get(authenticate, validateUserId, validateRequest, getProfile)
  
  .put(authenticate, upload.single('profileImg'),validateUserId,validateProfileUpdate, validateRequest,updateProfile)



module.exports=router