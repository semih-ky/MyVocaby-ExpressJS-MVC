const express = require("express");
const router = express.Router();

const { signupValidator } = require("../validators/validators");

const {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  postLogout
} = require("../controllers/auth");

router.get("/login", getLogin);

router.post("/login", postLogin);

router.get("/signup", getSignup);

router.post("/signup", signupValidator, postSignup);

router.post("/logout", postLogout);

module.exports = router;