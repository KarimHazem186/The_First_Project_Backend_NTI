const mongoose = require('mongoose')

const connectDB = ()=>{
    mongoose
        .connect(process.env.MONGO_URL)
        .then(()=>console.log("✅ MongoDB connected"))
        .catch((err)=>console.log("❌ DB connection error:",err))
};

module.exports=connectDB