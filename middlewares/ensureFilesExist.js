const appError = require("../utils/appError");

const ensureFilesExist = (req, res, next) => {
  if (!req.files?.audio || !req.files?.cover) {
    // return res.status(400).json({ message: "Audio and cover files are required" });
    throw appError.create('Audio and cover files are required',400)
  }
  next();
};

module.exports=ensureFilesExist