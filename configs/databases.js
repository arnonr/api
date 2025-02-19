const config = require("../configs/app");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "AIDM_Final",
    "cbg_aidm_db",
    process.env.DB_PASSWORD,

    //   "Yjjbkiti1w0QAlYVWgPqruZdZ2jDSL",
    //   config.DbDatabase ? config.DbDatabase : "aidm",
    //   config.DbUsername ? config.DbUsername : "aidm",
    //   config.DbPassword ? config.DbPassword : "2022@aidm",
    {
        logging: (msg) => msg.includes("Execution time") && console.log(msg),
        host: "122.155.195.17", //config.DbHostname ? config.DbHostname : "host.docker.internal",
        port: "1433",
        dialect: "mssql",
        // schema: "",
        // operatorsAlias: false,
        dialectOptions: {
            useUTC: false,
            instanceName: "MSSQLSERVER",
            options: {
                encrypt: false,
                requestTimeout: 120000, // 1นาที
            },
            //   options: { "requestTimeout": 300000 }
            //   requestTimeout: 600000,
            //   authentication: {
            //     type: "ntlm",
            //     options: {
            //       server: "http://122.155.195.17",
            //       userName: "ARNON",
            //       password: "21eba814IX795vqnrMi7M5aIBklxUZ",
            //     },
            //   },
        },
        timezone: "+07:00",
        pool: {
            max: 30,
            min: 2,
            acquire: 30000,
            idle: 5000, // ปิด connection ที่ไม่ได้ใช้งานเร็วขึ้น
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
