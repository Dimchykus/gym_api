// auth.js
const jwt = require("jsonwebtoken");

// Secret key for the JWT, you might want to store this in environment variables
const SECRET_KEY = "your-secret-key";

// Function to generate a token
function generateToken(user, isTrainer = false, isManager = false) {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      isTrainerOrManager: isTrainer || isManager,
      isManager: isManager,
    },
    SECRET_KEY
  );
}

// Function to verify a token
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (e) {
    return null;
  }
}

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("authHeader", authHeader);

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateUser,
};
