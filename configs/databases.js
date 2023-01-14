const config = require("../configs/app");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  config.DbDatabase ? config.DbDatabase : "aidm",
  config.DbUsername ? config.DbUsername : "aidm",
  config.DbPassword ? config.DbPassword : "2022@aidm",
  {
    host: config.DbHostname ? config.DbHostname : "host.docker.internal",
    port: config.DbPort,
    dialect: "mssql",
    schema: 'aidm',
    operatorsAlias: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 1000,
    },
    define: {
      timestamps: false,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("connected..");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
