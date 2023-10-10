// router.js
const express = require("express");
const Visitor = require("../models/visitor");
const { generateToken, verifyToken } = require("../utils/auth");
const User = require("../models/visitor"); // Assume you have a User model
const bcrypt = require("bcrypt");
const trainer = require("../models/trainer");
const manager = require("../models/manager");

const router = express.Router();

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
