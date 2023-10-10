const express = require("express");
const router = express.Router();
const Visitor = require("../models/visitor");
const Trainer = require("../models/trainer");
const Session = require("../models/session");
const Review = require("../models/review");
const { authenticateUser } = require("../utils/auth");

router.post("/review/:sessionId", authenticateUser, async (req, res) => {
  const sessionId = req.params.sessionId;
  const visitorId = req.user._id;

  try {
    // Find the session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Create a new review
    const review = new Review({
      comment: req.body.comment,
      rating: req.body.rating,
      visitor: visitorId,
      session: sessionId,
    });

    // Save the review
    await review.save();

    // Add the review to the session
    session.reviews.push(review._id);
    await session.save();

    // Return the review
    res.json(review);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while trying to leave a review.",
    });
  }
});


module.exports = router;
