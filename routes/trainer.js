const express = require("express");
const router = express.Router();
const Trainer = require("../models/trainer");
const Visitor = require("../models/visitor");
const { authenticateUser } = require("../utils/auth");
const mongoose = require("mongoose");

// Add more imports as required
const Session = require("../models/session");

/**
 * @swagger
 * /sessions:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Create a new session
 *     description: Create a new session for the authenticated trainer.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionInput'
 *     responses:
 *       201:
 *         description: Successfully created a new session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request or duplicate session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason.
 *       403:
 *         description: Forbidden, only trainers can create sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the server error.
 *     examples:
 *       RequestExample:
 *         summary: Example request for creating a session
 *         value:
 *           title: "Yoga Session"
 *           description: "Relaxation and flexibility"
 *           date: "2023-10-15T10:00:00Z"
 *           maxVisitors: 10
 *       ResponseExample:
 *         summary: Example response for creating a session
 *         value:
 *           title: "Yoga Session"
 *           description: "Relaxation and flexibility"
 *           date: "2023-10-15T10:00:00Z"
 *           maxVisitors: 10
 * components:
 *   schemas:
 *     SessionInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the session.
 *         description:
 *           type: string
 *           description: The description of the session.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the session.
 *         maxVisitors:
 *           type: integer
 *           minimum: 1
 *           description: The maximum number of visitors allowed for the session.
 *   Session:
 *     type: object
 *     properties:
 *       title:
 *         type: string
 *         description: The title of the session.
 *       description:
 *         type: string
 *         description: The description of the session.
 *       date:
 *         type: string
 *         format: date-time
 *         description: The date and time of the session.
 *       maxVisitors:
 *         type: integer
 *         minimum: 1
 *         description: The maximum number of visitors allowed for the session.
 *       trainer:
 *         type: string
 *         description: The ID of the trainer who created the session.
 */
router.post("/sessions", authenticateUser, async (req, res) => {
  // Check if the authenticated user is a trainer
  if (!req.user.isTrainerOrManager) {
    return res
      .status(403)
      .json({ message: "Only trainers can create sessions." });
  }

  try {
    // Check for an existing session with the same title, description, date and trainer
    const existingSession = await Session.findOne({
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      trainer: req.user._id,
    });

    // If an existing session was found, return an error
    if (existingSession) {
      return res.status(400).json({ message: "Duplicate session." });
    }

    // Create a new session
    const session = new Session({
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      maxVisitors: req.body.maxVisitors,
      trainer: req.user._id, // Use the authenticated trainer's ID
    });

    // Save the session
    await session.save();

    // Return the session
    res.json(session);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while trying to create the session.",
    });
  }
});

/**
 * @swagger
 * /sessions:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: Get sessions created by the authenticated trainer
 *     description: Retrieve sessions created by the authenticated trainer.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       403:
 *         description: Forbidden, only trainers can view their sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the server error.
 *     examples:
 *       RequestExample:
 *         summary: Example request for retrieving sessions
 *       ResponseExample:
 *         summary: Example response for retrieving sessions
 *         value:
 *           - title: "Yoga Session"
 *             description: "Relaxation and flexibility"
 *             date: "2023-10-15T10:00:00Z"
 *             maxVisitors: 10
 *           - title: "Pilates Session"
 *             description: "Strength and balance"
 *             date: "2023-10-16T15:00:00Z"
 *             maxVisitors: 8
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the session.
 *         description:
 *           type: string
 *           description: The description of the session.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the session.
 *         maxVisitors:
 *           type: integer
 *           minimum: 1
 *           description: The maximum number of visitors allowed for the session.
 */
router.get("/mySessions", authenticateUser, async (req, res) => {
  // Check if the authenticated user is a trainer
  if (!req.user.isTrainerOrManager) {
    return res
      .status(403)
      .json({ message: "Only trainers can view their sessions." });
  }

  try {
    // Get all sessions created by the authenticated trainer
    const sessions = await Session.find({ trainer: req.user._id });

    // Return the sessions
    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while trying to get the sessions.",
    });
  }
});

router.get("/sessions", authenticateUser, async (req, res) => {
  if (!req.user.isTrainerOrManager) {
    return res
      .status(403)
      .json({ message: "Only trainers can view their sessions." });
  }

  try {
    const sessions = await Session.find();

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while trying to get the sessions.",
    });
  }
});

router.put("/sessions/:sessionId", authenticateUser, async (req, res) => {
  // Check if the authenticated user is a trainer
  if (!req.user.isTrainerOrManager) {
    return res
      .status(403)
      .json({ message: "Only trainers can update sessions." });
  }

  const sessionId = req.params.sessionId;
  const userId = req.user._id;

  try {
    // Find the session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Check if the user is the owner of the session
    if (session.trainer.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own sessions." });
    }

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      req.body,
      { new: true } // This option returns the updated document
    );

    // Return the updated session
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while trying to update the session.",
    });
  }
});

router.get("/visitors", authenticateUser, async (req, res) => {
  // Check if the authenticated user is a trainer
  if (!req.user.isTrainerOrManager) {
    return res
      .status(403)
      .json({ message: "Only trainers can view their visitors." });
  }

  try {
    // Get all sessions created by the authenticated trainer
    const sessions = await Session.find({ trainer: req.user._id }).populate(
      "visitors"
    );

    // Collect all unique visitor IDs
    const visitorSet = new Set();
    sessions.forEach((session) => {
      session.visitors.forEach((visitor) => {
        visitorSet.add(String(visitor._id));
      });
    });

    // Convert string IDs to ObjectIDs
    const visitorIds = Array.from(visitorSet).map((id) =>
      mongoose.Types.ObjectId(id)
    );

    // Get all unique visitors
    const visitors = await Visitor.find({ _id: { $in: visitorIds } });

    // Return the visitors
    res.json(visitors);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while trying to get the visitors.",
    });
  }
});

router.get("/reviews", authenticateUser, async (req, res) => {
  const trainerId = req.user._id;

  try {
    // Find the sessions created by this trainer and populate the reviews
    const sessions = await Session.find({ trainer: trainerId }).populate({
      path: "reviews",
      populate: {
        path: "visitor",
        model: "Visitor",
      },
    });

    // Extract the reviews and merge them into one array
    let allReviews = [];
    sessions.forEach((session) => {
      allReviews = [...allReviews, ...session.reviews];
    });

    res.json(allReviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while trying to get the reviews.",
    });
  }
});

router.post(
  "/addVisitor/:visitorId/:sessionId",
  authenticateUser,
  async (req, res) => {
    const { visitorId, sessionId } = req.params;

    // Only allow trainers or managers to add visitors
    if (!req.user.isTrainerOrManager) {
      return res
        .status(403)
        .json({ message: "Only trainers can add visitors." });
    }

    try {
      const session = await Session.findById(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found." });
      }

      // Check if the current user is the trainer of this session
      if (session.trainer.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You can only add visitors to your own sessions." });
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
          .json({ message: "Visitor is already booked for this session." });
      }

      // Add the visitor to the session
      session.visitors.push(visitorId);
      await session.save();

      // Add the session to the visitor
      const visitor = await Visitor.findById(visitorId);
      visitor.sessions.push(sessionId);
      await visitor.save();

      res.json(session);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while trying to add the visitor.",
      });
    }
  }
);

router.delete(
  "/removeVisitor/:visitorId/:sessionId",
  authenticateUser,
  async (req, res) => {
    const { visitorId, sessionId } = req.params;

    // Only allow trainers or managers to remove visitors
    if (!req.user.isTrainerOrManager) {
      return res
        .status(403)
        .json({ message: "Only trainers can remove visitors." });
    }

    try {
      const session = await Session.findById(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found." });
      }

      // Check if the current user is the trainer of this session
      if (session.trainer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You can only remove visitors from your own sessions.",
        });
      }

      // Check if the visitor is booked for this session
      const visitorIndex = session.visitors.indexOf(visitorId);
      if (visitorIndex === -1) {
        return res
          .status(400)
          .json({ message: "Visitor is not booked for this session." });
      }

      // Remove the visitor from the session
      session.visitors.splice(visitorIndex, 1);
      await session.save();

      // Remove the session from the visitor
      const visitor = await Visitor.findById(visitorId);
      const sessionIndex = visitor.sessions.indexOf(sessionId);
      if (sessionIndex !== -1) {
        visitor.sessions.splice(sessionIndex, 1);
        await visitor.save();
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while trying to remove the visitor.",
      });
    }
  }
);

// Add more routes as required

module.exports = router;
