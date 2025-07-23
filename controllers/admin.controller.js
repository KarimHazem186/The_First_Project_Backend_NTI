const Audio = require('../models/audio.model');
const fs = require('fs');
const path = require('path');
// const validateMongoDbId = require('../utils/validateMongoDbId');
const asyncWrapper = require('../middlewares/asyncWrapper');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

const getAllAudios = asyncWrapper(async (req, res) => {
    const audios = await Audio.find().populate('user', 'name email');
    if(!audios){
        throw appError.create('Not Found',404)
    }
    res.json({ 
        success: httpStatusText.SUCCESS,
        audios 
    });
});


const deleteAudioById =asyncWrapper(async (req, res) => {
    const { id } = req.params;

    // validateMongoDbId(id)

    const audio = await Audio.findById(id);
    if (!audio) {

        // return res.status(404).json({ 
        //     success: httpStatusText.FAIL,
        //     message: 'Audio not found' 
        // });
        appError.create('Audio not found',404,httpStatusText.FAIL)
    }

    // Delete audio and cover files
    const deleteFileIfExists = (filePath) => {
        if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        }
    };

    deleteFileIfExists(audio.audioPath);
    deleteFileIfExists(audio.audioPath);

    await audio.deleteOne();

    // // Delete document from MongoDB using findByIdAndDelete
    // await Audio.findByIdAndDelete(id);

    res.json({ 
        success: httpStatusText.SUCCESS,
        message: 'Audio deleted successfully'
    });
});

module.exports={
    getAllAudios,
    deleteAudioById
}
