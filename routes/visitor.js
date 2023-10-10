const express = require("express");
const router = express.Router();
const Visitor = require("../models/visitor");
const Trainer = require("../models/trainer");
const Session = require("../models/session");
const { authenticateUser } = require("../utils/auth");

router.get("/myTrainers", authenticateUser, async (req, res) => {
  // Assume visitorId comes from the authenticated user
  const visitorId = req.user._id;

  try {
    // Find the visitor's sessions
    const visitor = await Visitor.findById(visitorId).populate("sessions");

    // Check if the visitor exists
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Check if the visitor has any sessions
    if (!visitor.sessions || visitor.sessions.length === 0) {
      return res
        .status(400)
        .json({ message: "You are not booked with any sessions." });
    }

    // Retrieve the trainers associated with each session
    const trainerIds = visitor.sessions.map((session) => session.trainer);
    const trainers = await Trainer.find({ _id: { $in: trainerIds } });

    // Return the trainers
    res.json(trainers);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while trying to get the trainers." });
  }
});

router.get("/mySessions", authenticateUser, async (req, res) => {
  const visitorId = req.user._id;

  try {
    const visitor = await Visitor.findById(visitorId).populate("sessions");

    console.log(visitor, visitorId);

    if (!visitor.sessions || visitor.sessions.length === 0) {
      return res
        .status(400)
        .json({ message: "You have not booked any sessions." });
    }

    res.json(visitor.sessions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while trying to get the sessions." });
  }
});

router.post("/book/:sessionId", authenticateUser, async (req, res) => {
  const sessionId = req.params.sessionId;
  const visitorId = req.user._id;

  try {
    // Find the session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (session.visitors.includes(visitorId)) {
      return res
        .status(400)
        .json({ message: "You are already booked for this session." });
    }

    // Check if there is a free spot
    if (session.visitors.length >= session.maxVisitors) {
      return res
        .status(400)
        .json({ message: "No free spots in this session." });
    }

    // Check if the visitor is already booked
    if (session.visitors.includes(visitorId)) {
      return res
        .status(400)
        .json({ message: "You are already booked for this session." });
    }

    const visitor = await Visitor.findById(visitorId);
    visitor.sessions.push(sessionId);
    await visitor.save();

    // Add the visitor to the session
    session.visitors.push(visitorId);
    await session.save();

    // Return the updated session
    res.json(session);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while trying to book the session." });
  }
});

router.delete("/unbook/:sessionId", authenticateUser, async (req, res) => {
  const sessionId = req.params.sessionId;
  const visitorId = req.user._id;

  try {
    // Find the session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Check if the visitor is already booked
    if (!session.visitors.includes(visitorId)) {
      return res
        .status(400)
        .json({ message: "You are not booked for this session." });
    }

    // Remove the visitor from the session
    session.visitors = session.visitors.filter(
      (visitor) => visitor.toString() !== visitorId
    );
    await session.save();

    // Remove the session from the visitor
    const visitor = await Visitor.findById(visitorId);
    visitor.sessions = visitor.sessions.filter(
      (session) => session.toString() !== sessionId
    );
    await visitor.save();

    // Return the updated session
    res.json(session);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while trying to unbook the session.",
    });
  }
});

// Add more routes as required

module.exports = router;
