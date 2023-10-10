// router.js
const express = require("express");
const Visitor = require("../models/visitor");
const { generateToken, verifyToken } = require("../utils/auth");
const User = require("../models/visitor"); // Assume you have a User model
const bcrypt = require("bcrypt");
const trainer = require("../models/trainer");
const manager = require("../models/manager");

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user and generate a token
 *     description: Authenticate a user based on their username and password and generate a token for access.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Successfully authenticated and generated a token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The authentication token for the user.
 *             example:
 *               token: "your_generated_token_here"
 *       401:
 *         description: Invalid username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the login failure.
 *             example:
 *               message: "Invalid username or password"
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let user;
  let role;

  // Find the user
  v = await Visitor.findOne({ username });
  t = await trainer.findOne({ username });
  m = await manager.findOne({ username });

  if (v) {
    role = "visitor";
    user = v;
  } else if (t) {
    role = "trainer";
    user = t;
  } else if (m) {
    role = "manager";
    user = m;
  }

  if (!user || !role) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Compare the provided password with the stored hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a token and return it
  const token = generateToken(user, role === "trainer", role === "manager");
  res.json({ token });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with a unique username and generate a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the new user (must be unique).
 *               password:
 *                 type: string
 *                 description: The password for the new user.
 *               name:
 *                 type: string
 *                 description: The name of the new user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the new user.
 *             required:
 *               - username
 *               - password
 *               - name
 *               - email
 *     responses:
 *       200:
 *         description: Successfully registered and generated a token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The authentication token for the new user.
 *             example:
 *               token: "your_generated_token_here"
 *       400:
 *         description: Username already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the username already exists.
 *             example:
 *               message: "Username already exists"
 *     examples:
 *       RequestExample:
 *         summary: Example request for user registration
 *         value:
 *           username: "new_user"
 *           password: "password123"
 *           name: "John Doe"
 *           email: "john.doe@example.com"
 *       ResponseExample:
 *         summary: Example response for successful user registration
 *         value:
 *           token: "your_generated_token_here"
 */
router.post("/register", async (req, res) => {
  const { username, password, name, email } = req.body;

  // Check if the username already exists
  const existingUser = await manager.findOne({ username });
  const existingUser1 = await trainer.findOne({ username });
  const existingUser2 = await Visitor.findOne({ username });

  if (existingUser || existingUser1 || existingUser2) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = new Visitor({
    username,
    password: hashedPassword,
    name,
    email,
    // other fields...
  });

  await user.save();

  // Generate a token and return it
  const token = generateToken(user);
  res.json({ token });
});

router.post("/trainer/register", async (req, res) => {
  const { username, password, name, email } = req.body;

  // Check if the username already exists
  const existingUser = await manager.findOne({ username });
  const existingUser1 = await trainer.findOne({ username });
  const existingUser2 = await Visitor.findOne({ username });

  if (existingUser || existingUser1 || existingUser2) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = new trainer({
    username,
    password: hashedPassword,
    name,
    email,
    // other fields...
  });

  await user.save();

  // Generate a token and return it
  const token = generateToken(user);
  res.json({ token });
});

router.post("/manager/register", async (req, res) => {
  const { username, password, name, email } = req.body;

  // Check if the username already exists
  const existingUser = await manager.findOne({ username });
  const existingUser1 = await trainer.findOne({ username });
  const existingUser2 = await Visitor.findOne({ username });

  if (existingUser || existingUser1 || existingUser2) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = new manager({
    username,
    password: hashedPassword,
    name,
    email,
    // other fields...
  });

  await user.save();

  // Generate a token and return it
  const token = generateToken(user);
  res.json({ token });
});

module.exports = router;
