const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");
const express = require("express");
const app = express();
const helmet = require("helmet");
const bodyParser = require("body-parser");

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const envFileExists = fs.existsSync(path.resolve(__dirname, ".env"));

if (envFileExists) {
  require("dotenv").config();
}

const SERVER_PORT = process.env.SERVER_PORT || 3333;
const username = process.env.USERNAME || "root";
const privateKeyPath = process.env.PRIVATE_KEY_PATH || `/home/${username}/.ssh/id_rsa`;
const trustProxy = process.env.TRUST_PROXY == "true" ? true : false;
const whilelist = process.env.IP_WHITELIST.split(',').concat(['localhost', '127.0.0.1']) || ['localhost', '127.0.0.1'];

if (trustProxy) {
  app.set("trust proxy", trustProxy);
}

function getRemoteAddress(address) {
  address = address.replace("::ffff:", "");

  if (address == "::1") {
    return "localhost";
  }

  return address;
}

app.get("/", (req, res) => {
  const remoteAddress = getRemoteAddress(req.ip);

  res.json({
    remoteAddress,
  });
});

app.post("/lock", (req, res) => {
  const clientIPAddress = getRemoteAddress(req.ip);

  console.log(`\n[${new Date()}] ${clientIPAddress} is trying to lock\n`);

  if (!req.body.password) {
    return res.status(401).json({
      success: false,
      error: "Invalid password",
    });
  }

  const key = fs.readFileSync(privateKeyPath, "utf8");
  const passphrase = req.body.password;

  let result = {
    success: false,
  };

  try {
    crypto.privateEncrypt(
      {
        key,
        passphrase,
      },
      Buffer.from(""),
    );

    result.success = true;
  } catch (err) {
    if (err.opensslErrorStack) {
      result.error = "Wrong password";
    }
  }

  if (result.success && !result.error && whilelist.includes(clientIPAddress)) {
    exec("loginctl lock-session");
    result.client = clientIPAddress;
  } else if (!whilelist.includes(clientIPAddress)) {
    result.success = false;
    result.error = "Client IP Address is not whitelisted";
  } else {
    result.success = false;
  }

  console.log(
    `\n[${new Date()}] ${clientIPAddress} locked and received: ${JSON.stringify(
      result,
      null,
      2,
    )}\n`,
  );

  res.json(result);
});

app.post("/unlock", (req, res) => {
  const clientIPAddress = getRemoteAddress(req.ip);

  console.log(`\n[${new Date()}] ${clientIPAddress} is trying to unlock\n`);

  if (!req.body.password) {
    return res.status(401).json({
      success: false,
      error: "Invalid password",
    });
  }

  const key = fs.readFileSync(privateKeyPath, "utf8");
  const passphrase = req.body.password;

  let result = {
    success: false,
  };

  try {
    crypto.privateEncrypt(
      {
        key,
        passphrase,
      },
      Buffer.from(""),
    );

    result.success = true;
  } catch (err) {
    if (err.opensslErrorStack) {
      result.error = "Wrong password";
    }
  }

  if (result.success && !result.error && whilelist.includes(clientIPAddress)) {
    exec(`loginctl unlock-session`);

    result.client = clientIPAddress;
  } else if (!whilelist.includes(clientIPAddress)) {
    result.success = false;
    result.error = "Client IP Address is not whitelisted";
  } else {
    result.success = false;
  }

  console.log(
    `\n[${new Date()}] ${clientIPAddress} unlocked and received: ${JSON.stringify(
      result,
      null,
      2,
    )}\n`,
  );

  res.json(result);
});

app.listen(SERVER_PORT, () => {
  console.log(`> Listening http://localhost:${SERVER_PORT}`);
});
