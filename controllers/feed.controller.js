const asyncWrapper = require('../middlewares/asyncWrapper');
const User = require('../models/user.model');
const Audio = require('../models/audio.model');
const appError = require('../utils/appError');  // Your custom error handler

const getUserFeed = asyncWrapper(async (req, res) => {
  const userId = req.user.userId;

  const currentUser = await User.findById(userId).populate('following');

  if (!currentUser) {
    throw appError.create('User not found', 404);
  }

  if (!currentUser.following.length) {
    return res.status(200).json({
      success: true,
      message: 'You are not following anyone yet.',
      feed: [],
      totalItems: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  }

  // Pagination params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const followedIds = currentUser.following.map(user => user._id);

  // Query to get public audios from followed users
  const [feed, total] = await Promise.all([
    Audio.find({ user: { $in: followedIds }, isPrivate: false }) // Only audios from followed users  // Only public audios
      .populate('user', 'name email') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Audio.countDocuments({ user: { $in: followedIds }, isPrivate: false }),
  ]);

  res.status(200).json({
    success: true,
    message: 'User feed fetched successfully',
    count:feed.length,
    feed,
    totalItems: total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});


module.exports = {getUserFeed}