const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
  name: String,
  email: String,
  trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trainer" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
  ],
});

module.exports = mongoose.model("Visitor", VisitorSchema);
