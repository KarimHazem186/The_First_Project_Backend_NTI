const mongoose = require("mongoose");
const appError = require("../utils/appError");

const validateMongoDbId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw appError.create("This id is not valid or not Found", 400);
  }
};

module.exports = validateMongoDbId;
