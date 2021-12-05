const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const quizRoutes = require("./routes/quiz");
const searchRoutes = require("./routes/search");
const wordRoutes = require("./routes/word");

app.set("view engine", "ejs");

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'mySessions'
});

app.use(session({
  secret: "some secret",
  resave: false,
  saveUninitialized: false,
  store: store
}));

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.get("/", (req, res) => {
  return res.render("login", {
    error: false,
    username: false
  });
});

app.use(authRoutes);
app.use(homeRoutes);
app.use(quizRoutes);
app.use(searchRoutes);
app.use(wordRoutes);

app.use((req, res, next) => {
  res.status(404).render("error", {
    httpStatusCode: 404,
    msg: "Page Not Found!"
  });
});


app.use((error, req, res, next) => {
  console.log(error);
  if (error.httpStatusCode) {
    res.status(error.httpStatusCode).render("error", {
      httpStatusCode: error.httpStatusCode,
      msg: error.msg
    })
  }
});

mongoose.connect(MONGODB_URI)
.then(result => {
  console.log("Databese connection successfull");
  app.listen(PORT);
})
.catch(err => {
  console.log("Databese connection failed");
  console.log(err);
  process.exit();
});