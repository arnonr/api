const express = require("express");
const https = require("https");
const config = require("./configs/app");
const app = express();

// Express Configs
require("./configs/express")(app);

// Middleware
require("./configs/middleware");

// Routes
app.use(require("./routes"));

// Error handler
require("./configs/errorHandler")(config.isProduction, app);

// const options = {
//     cert: fs.readFileSync("/cert/star_dld_go_th.crt"), // ใส่เส้นทางไปยังไฟล์ Certificate
//     key: fs.readFileSync("/cert/privkey.pem"), // ใส่เส้นทางไปยังไฟล์ Private Key
//     cert: fs.readFileSync("/cert/DigiCertCA.crt"), // ใส่เส้นทางไปยังไฟล์ Certificate
// };

// Start Server
const server = app.listen(config.port, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Server is running at http://${host}:${port}`);
});
