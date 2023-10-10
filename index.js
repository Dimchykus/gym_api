const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const Ui = require("oas3-tools");
const swaggerJSDoc = require("swagger-jsdoc");

// const passport = require("passport");

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "Your API Title",
    version: "1.0.0",
    description: "Description of your API",
    servers: ["http://localhost:5000"],
  },
  components: {
    securitySchemes: {
      Authorization: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        value: "Bearer <JWT token here>",
      },
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Specify the path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://dima:123123123@cluster0.ohwdwha.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

// Parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Passport
// app.use(passport.initialize());

// Set up routes
app.use("/", require("./routes"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
