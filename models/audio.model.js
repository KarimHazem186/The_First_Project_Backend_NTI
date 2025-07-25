const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
      validate: {
        validator: function (value) {
          return /^[\w\s.,!?"'-]+$/.test(value); // allows letters, numbers, spaces, punctuation
        },
        message: "Title contains invalid characters",
      },
    },

    genre: {
      type: String,
      enum: {
        values: ["education", "religion", "comedy", "fiction", "self-help"],
        message: "Genre must be one of: education, religion, comedy, fiction, self-help",
      },
      required: [true, "Genre is required"],
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    audioPath: {
      type: String,
      required: [true, "Audio path is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return /\.(mp3|wav|ogg)$/i.test(value);
        },
        message: "Audio path must be a valid audio file (.mp3, .wav, .ogg)",
      },
    },

    coverPath: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          // Optional, validate only if provided
          return !value || /\.(jpg|jpeg|png|webp)$/i.test(value);
        },
        message: "Cover image must be a valid image file (.jpg, .jpeg, .png, .webp)",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
           
    playCount: {
      type: Number,
      default: 0,
      min: [0, "Play count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Audio", audioSchema);
