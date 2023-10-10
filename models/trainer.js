const mongoose = require("mongoose");

const TrainerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: String,
  name: String,
  rating: Number,
  maxVisitors: Number,
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("Trainer", TrainerSchema);
