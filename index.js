const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const usersData = [];
app.post("/register", (req, res) => {
  if (
    req.body.username &&
    req.body.password &&
    req.body.name &&
    req.body.college &&
    req.body["year-of-graduation"]
  ) {
    var found = false;
    for (var i = 0; i < usersData.length; i++) {
      if (usersData[i].username == req.body.username) {
        found = true;
        break;
      }
    }
    if (found == false) {
      let salt = crypto.randomBytes(16).toString("base64");
      let hash = crypto
        .createHmac("sha512", salt)
        .update(req.body.password)
        .digest("base64");
      req.body.password = salt + "$" + hash;

      const currentUserData = {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        college: req.body.college,
        "year-of-graduation": req.body["year-of-graduation"],
      };
      usersData.push(currentUserData);
      console.log(usersData);
      res.send({ message: "Successfully registered!" });
    } else {
      res.status(400).json({ message: "username exists!" });
    }
  } else {
    res.status(400).json({ message: "Fill all details!" });
  }
});

app.get("/profiles", (req, res) => {
  const usersDataCopy = JSON.parse(JSON.stringify(usersData));
  usersDataCopy.map((user) => delete user["password"]);
  res.json(usersDataCopy);
});

const authenticationLogin = (req, res, next) => {
  const authHeader = req.headers["Authorization"];
  const token = authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.Secret_Key_For_JWT, (err, user) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.userInfo = user;

    next();
  });
};

app.post("/login", (req, res) => {
  if (req.body.username && req.body.password) {
    var found = false;
    var userName = "";

    for (var i = 0; i < usersData.length; i++) {
      let passwordFields = usersData[i].password.split("$");
      let salt = passwordFields[0];
      let hash = crypto
        .createHmac("sha512", salt)
        .update(req.body.password)
        .digest("base64");

      if (
        usersData[i].username == req.body.username &&
        passwordFields[1] == hash
      ) {
        found = true;
        userName = usersData[i].username;
        break;
      }
    }

    const dataToSign = {
      username: userName,
    };
    const token = jwt.sign(
      {
        data: dataToSign,
      },
      process.env.Secret_Key_For_JWT,
      { expiresIn: 60 * 60 }
    );

    if (!found) {
      res.status(400).json({ message: "username or password is incorrect!" });
    } else {
      res.setHeader("Authorization", `Bearer ${token}`);
      res.send(200);
    }
  }
});

app.put("/profile", authenticationLogin, (req, res) => {
  if (req.body.name && req.body.college && req.body["year-of-graduation"]) {
    const username = req.userInfo.username;
    for (let i = 0; i < usersData.length; i++) {
      if (usersData[i].username == username) {
        usersData[i].name = req.body.name;
        usersData[i].college = req.body.college;
        usersData[i]["year-of-graduation"] = req.body["year-of-graduation"];
        console.log(usersData[i]);
      }
    }
    res.sendStatus(200);
  }
});

app.listen(7050);
