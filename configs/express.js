const express = require("express"),
  // morgan ไว้ show log ใน console
  morgan = require("morgan"),
  cors = require("cors"),
passport = require("passport"), 
path = require("path");

//
const DeviceDetector = require("node-device-detector");
const ClientHints = require("node-device-detector/client-hints");

module.exports = async (app) => {
  // Connect MongoDB
  //   require("../configs/databases");
  const db = require("../models/index.js");

  // CORS
  const allowedOrigins = [
    "*",
    "http://localhost:8080",
    "http://178.128.216.177",
    "http://192.168.1.131:8080",
    "http://178.128.216.177:8080",
    "http://10.11.1.70",
    "http://10.11.1.70:80",
    "http://122.155.208.221",
    "http://122.155.208.221:80"
  ];
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
  // app.use(cors(corsOptions));


  app.use(
    cors({
      origin: "*",
    })
  );

  // Parser Body
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger
  app.use(morgan("dev"));

  // device
  const deviceDetector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
  });
  const clientHints = new ClientHints();

  // create middleware
  const middlewareDetect = (req, res, next) => {
    const useragent = req.headers["user-agent"];
    const clientHintsData = clientHints.parse(res.headers);

    req.useragent = useragent;
    req.device = deviceDetector.detect(useragent, clientHintsData);
    req.bot = deviceDetector.parseBot(useragent);
    next();
  };

  app.use(middlewareDetect);

  // Passport
  require("../configs/passport");

  // Static file
//   app.use("/static", express.static(path.join(__dirname, "../public")));
  app.use("*/static", express.static(__dirname + '/public'));
//   app.use('/static', express.static(path.join(__dirname, 'public')))
//   app.use('/static', express.static('public'))
  // http://localhost:3000/static/uploads/images/users/user-1-1652789767517.jpeg

  // Custom Response Format
  app.use(require("../configs/responseFormat"));
};
