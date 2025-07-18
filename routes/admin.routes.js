const express = require('express');
const { authorizeRole } = require('../middlewares/authorizeRole');
const { getAllAudios, deleteAudioById } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const idValidator = require('../validators/idValidator');
const validateRequest = require('../middlewares/validateRequest');
const router = express.Router();

router.get('/audios',authenticate, authorizeRole('admin'), getAllAudios);
router.delete('/audio/:id',authenticate,authorizeRole('admin'),idValidator,validateRequest ,deleteAudioById);


module.exports = router;
