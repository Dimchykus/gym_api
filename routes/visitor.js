const express = require("express");
const router = express.Router();
const Visitor = require("../models/visitor");
const Trainer = require("../models/trainer");
const Session = require("../models/session");
const { authenticateUser } = require("../utils/auth");
// Add more imports as required

/**
 * @swagger
 * /myTrainers:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: Get trainers associated with the authenticated visitor
 *     description: Retrieve the trainers associated with the sessions booked by the authenticated visitor.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of trainers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trainer'
 *       400:
 *         description: Bad request or visitor not booked with any sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason.
 *       404:
 *         description: Visitor not found.
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
 *         summary: Example request for retrieving trainers
 *       ResponseExample:
 *         summary: Example response for retrieving trainers
 *         value:
 *           - name: "Trainer 1"
 *             specialty: "Fitness"
 *           - name: "Trainer 2"
 *             specialty: "Yoga"
 * components:
 *   schemas:
 *     Trainer:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the trainer.
 *         specialty:
 *           type: string
 *           description: The specialty of the trainer.
 */
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

/**
 * @swagger
 * /mySessions:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: Get sessions booked by the authenticated visitor
 *     description: Retrieve the sessions booked by the authenticated visitor.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request or visitor has not booked any sessions.
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
 *           - date: "2023-10-10"
 *             time: "10:00 AM"
 *             trainer: "Trainer 1"
 *           - date: "2023-10-11"
 *             time: "3:00 PM"
 *             trainer: "Trainer 2"
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the session.
 *         time:
 *           type: string
 *           description: The time of the session.
 *         trainer:
 *           type: string
 *           description: The name of the trainer for the session.
 */
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

/**
 * @swagger
 * /book/{sessionId}:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Book a session
 *     description: Book a session for the authenticated visitor.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to book.
 *     responses:
 *       200:
 *         description: Successfully booked the session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request or session is already booked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason.
 *       404:
 *         description: Session not found.
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
 *         summary: Example request for booking a session
 *         parameters:
 *           sessionId: "session123"
 *       ResponseExample:
 *         summary: Example response for booking a session
 *         value:
 *           date: "2023-10-10"
 *           time: "10:00 AM"
 *           trainer: "Trainer 1"
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the session.
 *         time:
 *           type: string
 *           description: The time of the session.
 *         trainer:
 *           type: string
 *           description: The name of the trainer for the session.
 */
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

/**
 * @swagger
 * /unbook/{sessionId}:
 *   delete:
 *     security:
 *       - Authorization: []
 *     summary: Unbook a session
 *     description: Unbook a session for the authenticated visitor.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to unbook.
 *     responses:
 *       200:
 *         description: Successfully unbooked the session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request or visitor is not booked for the session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason.
 *       404:
 *         description: Session not found.
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
 *         summary: Example request for unbooking a session
 *         parameters:
 *           sessionId: "session123"
 *       ResponseExample:
 *         summary: Example response for unbooking a session
 *         value:
 *           date: "2023-10-10"
 *           time: "10:00 AM"
 *           trainer: "Trainer 1"
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the session.
 *         time:
 *           type: string
 *           description: The time of the session.
 *         trainer:
 *           type: string
 *           description: The name of the trainer for the session.
 */

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
