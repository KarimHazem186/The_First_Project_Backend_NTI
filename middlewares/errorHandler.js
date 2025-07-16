// global Error handler delete id not found
module.exports=((error,req,res,next)=>{
    res.status(error.statusCode||500).json({
        status:error.statusText ||
        httpStatusText.ERROR || 'error' ,
        message:error.message || 'Something went wrong',
        code:error.statusCode||500,
        errors:error.errors || null,
        data:null
    })
})




// module.exports = (err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     error: 'Internal Server Error'
//   });
// };


