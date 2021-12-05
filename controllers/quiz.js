const { validationResult } = require('express-validator');
const User = require("../models/user");

exports.getQuiz = (req, res) => {
  return res.render("quiz");
}

exports.postQuiz = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({
      error: validation.errors[0].msg
    });
  }

  let user;
  try {
    user = await User.findById(req.session.user).populate("words.word");
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  if (!user) {
    return res.status(404).json({
      error: "User not found!"
    });
  }

  if (user.words.length < parseInt(req.body.numberOfQuestions)) {
    return res.status(404).json({
      error: `You don't have at least ${req.body.numberOfQuestions} word cards!`
    });
  }

  let words = user.words.map(item => {
    return {
      id: item.word._id,
      word: item.word.word,
      type: item.word.type,
      definition: item.word.definition,
      example: item.word.example
    }
  });

  return res.status(200).json({words});
}