const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const SSHClient = require("ssh2").Client;
const whilelist = require("./ip-whitelist.json");

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const envFileExists = fs.existsSync(`${__dirname}/.env`);

if (envFileExists) {
  require("dotenv").config();
}

const SERVER_PORT = process.env.SERVER_PORT || 3333;
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 22;
const username = process.env.USERNAME || "root";
const privateKeyPath = process.env.PRIVATE_KEY_PATH || `/home/${username}/.ssh/id_rsa`;
const privateKey = fs.readFileSync(privateKeyPath);

app.get("/", (req, res) => {
    res.json({
        remoteAddress: req.ip || req.connection.remoteAddress,
    });
});

app.post("/lock", () => {

    // const conn = new SSHClient();
    // conn.connect({
    //     host,
    //     port,
    //     username,
    //     privateKey,
    // });
});

app.post("/unlock", () => {});

app.listen(SERVER_PORT, () => {
    console.log(`> Listening http://localhost:${SERVER_PORT}`);
});