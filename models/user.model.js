const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator');
const userRoles = require('../utils/role');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name must not exceed 50 characters'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]+$/.test(value);
            },
            message: 'Name can only contain letters and spaces'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        trim:true,
        validate: {
            validator: function (value) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(value);
            },
            message: 'Invalid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        trim: true,
        select: false, 
        validate: {
        validator: function (value) {
                return /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value);
            },
            message: 'Password must contain at least one number and one special character'
        }
    },
    role:{
        type:String,
        enum:[userRoles.USER,userRoles.ADMIN],
        default:userRoles.USER
    },
    profileImg:{
        type:String,
        // default:'default.jpg',    
    },
    refreshToken:String
},{
    timestamps: true
})


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 

  this.password = await bcrypt.hash(this.password, 10); 
  next();
});



const User = mongoose.model("User",userSchema);
module.exports =User;
