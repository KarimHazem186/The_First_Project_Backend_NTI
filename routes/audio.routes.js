const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config/multer.uploads');
const { createAudioValidation } = require('../validators/createAudioValidation');
const { updateAudioValidation } = require('../validators/updateAudioValidation');
const { createAudio,updateAudio,incrementPlayCount, getAllPublicAudio, getMyAudios, streamAudio, deleteAudio, searchAudio, likeAudio, commentAudio } = require('../controllers/audio.controller');
const validateRequest = require('../middlewares/validateRequest'); 
const {authenticate} = require('../middlewares/authMiddleware'); 
const ensureFilesExist = require('../middlewares/ensureFilesExist');
const idValidator = require('../validators/idValidator');

router.route('/')
    .post(
        authenticate,
        upload.fields([
            { name: 'audio', maxCount: 1 },
            { name: 'cover', maxCount: 1 },
        ]),
        ensureFilesExist,
        createAudioValidation,
        validateRequest,
        createAudio
    )
    .get(
        // authenticate,
        getAllPublicAudio
    )


router.get('/mine',authenticate , getMyAudios);

// Stream
router.get('/stream/:id',authenticate,idValidator,validateRequest,streamAudio);



router.route('/:id')
    .put(
    authenticate,
    idValidator,
    validateRequest,
    upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]),
    //   ensureFilesExist, // Optional: only if required to always upload files
    updateAudioValidation, // Optional: you can create a separate update validator
    // validateRequest,
    updateAudio
    )
    .delete( 
        authenticate,
        idValidator,
        validateRequest, 
        deleteAudio
    );


router.get('/search',searchAudio)    

router.patch('/:id/play',idValidator,validateRequest, incrementPlayCount);

// Like audio
router.post('/:id/like', authenticate, likeAudio);


// Add comment to audio
router.post('/:id/comment', authenticate, commentAudio);



module.exports = router;
