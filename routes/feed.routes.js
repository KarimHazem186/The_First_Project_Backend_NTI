// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { getUserFeed } = require('../controllers/feed.controller');

router.get('/', authenticate, getUserFeed); // GET /api/feed

module.exports = router;
