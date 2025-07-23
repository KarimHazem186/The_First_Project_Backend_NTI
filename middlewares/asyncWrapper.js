// utils/asyncWrapper.js
module.exports = (asyncFun) => {
  return async (req, res) => {
    try {
      await asyncFun(req, res);
    } catch (err) {
      console.error("Caught error:", err);
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
      });
    }
  };
};

// module.exports=(asyncFun)=>{
//     return(req,res,next)=>{
//         asyncFun(req,res,next).catch((err)=>{
//             next(err);
//         })
//     }
// }