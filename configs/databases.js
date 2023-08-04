const config = require("../configs/app");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  config.DbDatabase,
  config.DbUsername,
  config.DbPassword,
  {
    logging: console.log,
    host: config.DbHostname, //config.DbHostname ? config.DbHostname : "host.docker.internal",
    port: "1433",
    dialect: "mssql",
    dialectOptions: {
        instanceName: "MSSQLSERVER",
      options: {
        encrypt: false,
      },
    },
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
