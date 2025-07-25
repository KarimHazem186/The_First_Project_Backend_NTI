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


const userRoutes = require('./routes/user.routes.js');
const audioRoutes = require('./routes/audio.routes');
const adminRoutes = require('./routes/admin.routes');
const morgan = require('morgan');




const app = express()


// Middleware
app.use(helmet());
app.use(express.json())

// app.use(morgan('combined')); // ✅    
app.use(morgan('dev')); // ✅  
app.use(morganMiddleware); // ✅ logs


logger.info('Starting app...');
logger.warn('Low disk space');
logger.error('Something went wrong');

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});


process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);  
});


// Sample route
app.get('/', (req, res) => {
  // logger.info('GET / route hit');
  res.send('Welcome to the Library App');
});

app.get('/fail', (req, res) => {
  throw new Error('💥 Crash route hit!');
});


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



app.use("/api/auth",userRoutes);

// app.use("/api/profile", require("./routes/profileRoutes"));

app.use("/api/audio", audioRoutes);

app.use("/api/admin",adminRoutes );




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