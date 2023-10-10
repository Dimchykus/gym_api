const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  maxVisitors: {
    type: Number,
    default: 10,
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  visitors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;
