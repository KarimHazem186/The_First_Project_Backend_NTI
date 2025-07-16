
// const catchAsync = require('../utils/catchAsync')
// const appError = require('../utils/AppError')

// // utils/catchAsync.js
// module.exports = function catchAsync(fn) {
//   return function (req, res, next) {
//     fn(req, res, next).catch(next); // Pass errors to Express error middleware
//   };
// };

// const isAdmin = catchAsync(async (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     throw appError.create('Access denied: Admins only', 403);
//   }
//   next();
// });


// router.get('/secure-route', catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id);
//   if (!user) throw appError.create('User not found', 404);
//   res.json(user);
// }));
