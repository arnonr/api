const express = require("express"),
  // morgan ไว้ show log ใน console
  morgan = require("morgan"),
  cors = require("cors");
(passport = require("passport")), (path = require("path"));

module.exports = async (app) => {
  // Connect MongoDB
//   require("../configs/databases");
    const db = require('../models/index.js')

  // CORS
  const allowedOrigins = ['*','http://localhost:8080','http://178.128.216.177','http://192.168.1.131:8080'];
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  };
  app.use(cors(corsOptions));

  // Parser Body
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger
  app.use(morgan("dev"));

  // Passport
  require("../configs/passport");

  // Static file
  app.use("/static", express.static(path.join(__dirname, "../public")));
  // http://localhost:3000/static/uploads/images/users/user-1-1652789767517.jpeg

  // Custom Response Format
  app.use(require("../configs/responseFormat"));
};
