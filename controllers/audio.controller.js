const asyncWrapper = require('../middlewares/asyncWrapper');
const appError = require('../utils/appError');
const Audio = require('../models/audio.model');
const validateMongoDbId = require('../utils/validateMongoDbId');
const httpStatusText = require('../utils/httpStatusText');

const fs = require('fs');
const path = require('path');

const createAudio = asyncWrapper(async (req, res) => {
  const { title, genre, isPrivate } = req.body;

  if (!req.files?.audio) {
    throw appError.create('Audio file is required', 400);
  }

  // const audioUrl = `/uploads/audios/${req.files.audio[0].filename}`;
  // const coverUrl = req.files?.cover?.[0] ? `/uploads/covers/${req.files.cover[0].filename}` : null;


  const filename = req.files.audio[0].filename;
  const relativePath = path.join('audio', `user_${req.user.userId}`, filename);

  const audio = await Audio.create({
    title,
    genre,
    isPrivate: isPrivate === 'true' || isPrivate === true,
    // audioPath: req.files.audio[0].filename,
    audioPath:relativePath,
    // coverPath: req.files.cover ? req.files.cover[0].filename : null,
    coverPath: req.files.cover ? path.join('covers', `user_${req.user.userId}`, req.files.cover[0].filename) : null,
    user: req.user.userId, 
  });

  res.status(201).json({
    success: httpStatusText.SUCCESS,
    message: 'Audio uploaded successfully',
    data: {
      id: audio._id,
      title: audio.title,
      genre: audio.genre,
      isPrivate: audio.isPrivate,
    },
  });
});


const getAllPublicAudio = asyncWrapper(async(req,res)=>{
    const audios = await Audio.find({ isPrivate: false }).populate('user', 'name -_id');
    if(!audios) throw appError.create('Not Found',404)
    res.json({
      success: httpStatusText.SUCCESS,
      audios,
    })
})

const getMyAudios = asyncWrapper(async(req,res)=>{
  const audios = await Audio.find({ user: req.user.userId });
  if(!audios) throw appError.create('Not Audios',404)
  res.json(audios);
})


const streamAudio = asyncWrapper(async (req, res) => {
  const id = req.params.id
  validateMongoDbId(id);
  const audio = await Audio.findById(id);

  if (!audio || (audio.isPrivate && audio.user.toString() !== req.user.userId)) {
    // return res.status(404).json({ message: 'Audio not found or unauthorized' });
    throw appError.create('Audio not found or unauthorized',404)
  }


  const filePath = path.join(__dirname, '..', 'uploads',audio.audioPath);

  console.log('🛤️ audio.audioPath:', audio.audioPath);
  console.log('📂 Full path:', filePath);

  if (!fs.existsSync(filePath)) {
    // return res.status(404).json({ message: 'Audio file not found on disk' });
      throw appError.create('Audio file not found on disk',404)

  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    // If no range header, send full file (not ideal for streaming)
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': fileSize,
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const CHUNK_SIZE = 1 * 1e6; // 1MB
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);
  // const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  const contentLength = end - start + 1;

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'audio/mpeg',
  };

  res.writeHead(206, headers);
  const stream = fs.createReadStream(filePath, { start, end });
  stream.pipe(res);
});



const updateAudio = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const { title, genre, isPrivate } = req.body;

  const audio = await Audio.findById(id);
  if (!audio) {
    throw appError.create('Audio not found', 404);
  }

  // Optional: Ensure user is owner
  if (audio.user.toString() !== req.user.userId) {
    throw appError.create('Unauthorized to update this audio', 403);
  }

  // Update fields
  if (title !== undefined) audio.title = title;
  if (genre !== undefined) audio.genre = genre;
  if (isPrivate !== undefined) audio.isPrivate = isPrivate === 'true' || isPrivate === true;

  // If new files are uploaded
  if (req.files?.audio) {
    audio.audioPath = req.files.audio[0].filename;
  }

  // if (req.files?.cover) {
  //   audio.coverPath = `/uploads/covers/${req.files.cover[0].filename}`;
  // }

  if (req.files?.cover) {
    audio.coverPath = req.files.cover[0].filename;
  }

  await audio.save();

  res.status(200).json({
    status: 'success',
    message: 'Audio updated successfully',
    data: {
      id: audio._id,
      title: audio.title,
      genre: audio.genre,
      isPrivate: audio.isPrivate,
    },
  });
});




const incrementPlayCount = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const audio = await Audio.findById(id);
  if (!audio) {
    throw appError.create('Audio not found', 404);
  }

  audio.playCount += 1;
  await audio.save();

  ////////////

  // await Audio.findByIdAndUpdate(id, { $inc: { playCount: 1 } }, { new: true });


  res.status(200).json({
    status: 'success',
    message: 'Play count incremented',
    playCount: audio.playCount,
  });
});


const deleteAudio = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);

  // 1. Fetch the audio first
  const audio = await Audio.findById(id);
  if (!audio) {
    return res.status(404).json({ message: 'Audio not found' });
  }

  // 2. Check ownership
  if (audio.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // 3. Delete file from disk (optional but recommended)
  const filePath = path.join(__dirname, '..', 'uploads', audio.audioPath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // remove audio file
  }


   // 4. Delete the cover image if it exists
  if (audio.coverPath) {
    const coverPath = path.join(__dirname, '..', 'uploads', audio.coverPath);
    try {
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    } catch (err) {
      console.error('❌ Error deleting cover image:', err.message);
    }
  }

  // audio.coverPath = path.join('cover', `user_${userId}`, coverFileName);


  // 4. Delete from database
  await Audio.deleteOne({ _id: id });

  res.json({ status: 'deleted' });
});


module.exports = {
  createAudio,
  getAllPublicAudio,
  getMyAudios,
  streamAudio,
  updateAudio,
  deleteAudio,
  incrementPlayCount
}
