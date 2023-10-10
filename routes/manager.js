const express = require("express");
const router = express.Router();
const Visitor = require("../models/visitor");
const Trainer = require("../models/trainer");
const Session = require("../models/session");
const Review = require("../models/review");
const { authenticateUser } = require("../utils/auth");

/**
 * @swagger
 * /manager/trainers:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: Retrieve a list of all trainers
 *     description: Retrieve a list of all trainers available.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of trainers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *             example:
 *               - name: "Trainer 1"
 *                 specialty: "Fitness"
 *               - name: "Trainer 2"
 *                 specialty: "Yoga"
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
 *             example:
 *               message: "Internal server error"
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
 */
router.get("/trainers", authenticateUser, async (req, res) => {
  // Show all trainers
  const trainers = await Trainer.find();
  res.json(trainers);
});

/**
 * @swagger
 * /addTrainer:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Add a new trainer
 *     description: Add a new trainer to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: Successfully added a new trainer.
 *         content:
 *           application/json:
 *       400:
 *         description: Bad request. Invalid trainer data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating a bad request.
 *             example:
 *               message: "Bad request. Invalid trainer data."
 *     examples:
 *       RequestExample:
 *         summary: Example request for adding a new trainer
 *         value:
 *           name: "New Trainer"
 *           specialty: "Fitness"
 *       ResponseExample:
 *         summary: Example response for successfully adding a new trainer
 *         value:
 *           name: "New Trainer"
 *           specialty: "Fitness"
 */
router.post("/addTrainer", authenticateUser, async (req, res) => {
  // Add a new trainer
  const trainer = new Trainer(req.body);
  await trainer.save();
  res.status(201).json(trainer);
});

router.put("/editTrainer/:trainerId", authenticateUser, async (req, res) => {
  // Edit a trainer
  const trainer = await Trainer.findByIdAndUpdate(
    req.params.trainerId,
    req.body,
    { new: true }
  );
  res.json(trainer);
});

router.delete(
  "/deleteTrainer/:trainerId",
  authenticateUser,
  async (req, res) => {
    // Delete a trainer
    await Trainer.findByIdAndDelete(req.params.trainerId);
    res.status(204).send();
  }
);

router.get("/topTrainers", authenticateUser, async (req, res) => {
  // Check if the authenticated user is a manager
  if (!req.user.isManager) {
    return res
      .status(403)
      .json({ message: "Only managers can view top trainers." });
  }

  try {
    // Get all trainers
    const trainers = await Trainer.find().lean();

    // Calculate average rating for each trainer
    for (let trainer of trainers) {
      const sessions = await Session.find({ trainer: trainer._id }).populate(
        "reviews"
      );
      let totalRating = 0;
      let totalReviews = 0;

      for (let session of sessions) {
        for (let review of session.reviews) {
          totalRating += review.rating;
          totalReviews++;
        }
      }

      if (totalReviews > 0) {
        trainer.averageRating = totalRating / totalReviews;
      } else {
        trainer.averageRating = 0;
      }
    }

    // Sort trainers by average rating
    trainers.sort((a, b) => b.averageRating - a.averageRating);

    // Return the top 5 trainers
    res.json(trainers.slice(0, 5));
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while trying to fetch the top trainers.",
    });
  }
});

router.get("/topVisitors", authenticateUser, async (req, res) => {
  // Only allow managers to view top visitors
  if (!req.user.isManager) {
    return res
      .status(403)
      .json({ message: "Only managers can view top visitors." });
  }

  try {
    // Get all visitors
    const visitors = await Visitor.find().lean();

    // For each visitor, count the number of sessions
    for (let visitor of visitors) {
      const sessions = await Session.find({ visitors: visitor._id });
      visitor.sessionCount = sessions.length;
    }

    // Sort visitors by session count
    visitors.sort((a, b) => b.sessionCount - a.sessionCount);

    // Return the top 5 visitors
    res.json(visitors.slice(0, 5));
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while trying to fetch the top visitors.",
    });
  }
});

router.get("/allSessionsReviews", authenticateUser, async (req, res) => {
  // Only allow managers to view all sessions and reviews
  if (!req.user.isManager) {
    return res
      .status(403)
      .json({ message: "Only managers can view all sessions and reviews." });
  }

  try {
    // Fetch all sessions and their reviews
    const sessions = await Session.find().populate("reviews");

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message:
        "An error occurred while trying to fetch all sessions and reviews.",
    });
  }
});

// Add more routes as required

module.exports = router;
