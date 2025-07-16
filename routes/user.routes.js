const express = require("express");
const { refreshToken, signup } = require("../controllers/user.controller");
const validateRegister = require("../validators/validateRegister");
const validateRequest = require("../middlewares/validateRequest");
const router = express.Router();

router.post('/refresh-token',refreshToken)
router.post('/signup',validateRegister(),validateRequest,signup)




module.exports=router