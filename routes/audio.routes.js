const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config/multer.uploads');
const { createAudioValidation } = require('../validators/createAudioValidation');
const { updateAudioValidation } = require('../validators/updateAudioValidation');
const { createAudio,updateAudio,incrementPlayCount, getAllPublicAudio, getMyAudios, streamAudio, deleteAudio, searchAudio, likeAudio, commentAudio, getPublicAudio, getPublicAudios, getAudioComments, likeAudios, unlikeAudios, getAudioLikes } = require('../controllers/audio.controller');
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
    // .get(
    //    // authenticate,
    //     getAllPublicAudio
    // )
    .get(
        // authenticate,
        getPublicAudio
    )

    /// ORRRRRRRR

router.get('/audios', getPublicAudios);



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

router.put('/:id/play',idValidator,validateRequest, incrementPlayCount);

// ORRRRRRRRRR

// router.post('/:id/play', incrementPlayCount);


// Like audio
router.post('/:id/like', authenticate, likeAudio);


// router.post('/:id/like', authenticate, likeAudios);
// router.post('/:id/unlike', authenticate, unlikeAudios);
router.get('/:id/likes', authenticate, getAudioLikes);



// Add comment to audio
router.post('/:id/comment', authenticate, commentAudio);

// Get comments of audio
router.get('/:id/comments', getAudioComments);


module.exports = router;
