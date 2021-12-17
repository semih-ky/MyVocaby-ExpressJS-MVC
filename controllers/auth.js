const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res) => {
  return res.render("login", {
    error: false,
    username: false,
  });
};

exports.getSignup = (req, res) => {
  res.render("signup", {
    error: false,
    username: false,
  });
};

exports.postLogin = async (req, res, next) => {
  const validation = validationResult(req);

  const username = req.body.username;
  const password = req.body.password;

  if (!validation.isEmpty()) {
    return res.render("login", {
      error: validation.errors[0],
      username: username,
    });
  }

  let user;
  try {
    user = await User.findOne({ username: username });
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  if (!user) {
    return res.render("login", {
      error: {
        msg: "Invalid username or password!",
      },
      username: username,
    });
  }

  let isPasswordsMatch;
  try {
    isPasswordsMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  if (!isPasswordsMatch) {
    return res.render("login", {
      error: {
        msg: "Wrong password!",
      },
      username: username,
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/home");
  });
};

exports.postSignup = async (req, res, next) => {
  const validation = validationResult(req);

  const username = req.body.username;
  const password = req.body.password;

  if (!validation.isEmpty()) {
    return res.render("signup", {
      error: validation.errors[0],
      username: username,
    });
  }

  try {
    const isUserExist = await User.findOne({ username: username });
    if (isUserExist) {
      const error = new Error();
      error.httpStatusCode = 401;
      error.msg = "Invalid username!";
      return next(error);
    }
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  const user = new User({
    username,
    password: hashedPassword,
  });

  try {
    await user.save();
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save((err) => {
    if (err) return next(err);
    res.redirect("/home");
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
};
