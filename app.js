const express = require('express')
require('dotenv').config()

const path= require('path')
const morganMiddleware = require('./middlewares/logMiddleware');
const logger = require('./utils/loggers');
const cookieParser = require('cookie-parser')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler.js');

const httpStatusText = require('./utils/httpStatusText')
const appError = require('./utils/appError.js')


const userRoutes = require('./routes/user.routes.js')




const app = express()


// Middleware
app.use(helmet());
app.use(express.json())
app.use(morganMiddleware); // ✅ log every request

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again after a minute.'
  }
});

app.use(limiter);

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());

// Static serving of uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use("/api/users",userRoutes);



app.get('/error', (req, res, next) => {
  const error = new Error("Something went wrong!");
  next(error); 
});


// global middleware for not found router
app.all('*',(req,res,next)=>{
    next(appError.create('Resource not found',404,httpStatusText.FAIL))
})




// Global Error Handler
app.use(errorHandler);



module.exports = app