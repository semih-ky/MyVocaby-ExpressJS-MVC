const Vocabulary = require("../models/vocabulary");
const User = require("../models/user");

exports.saveWord = async (req, res, next) => {
  const wordID = req.body.wordID;

  let word;
  try {
    word = await Vocabulary.findById(wordID);
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  if (!word) {
    return res.status(404).json({
      error: "Word can not found!"
    });
  }

  let wordItem = {
    word,
    history: new Date()
  }

  try {
    let user = await User.findById(req.session.user._id);
    user.words.push(wordItem);
    await user.save();
    return res.status(201).json({
      message: "Successful!"
    });
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }
}


exports.removeWord = async (req, res, next) => {
  const wordID = req.body.wordID;

  let word;
  try {
    word = await Vocabulary.findById(wordID);
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  if (!word) {
    return res.status(404).json({
      error: "Word can not found!"
    });
  }

  try {
    let user = await User.findById(req.session.user._id);
    let updatedWords = user.words.filter(item => item.word._id.toString() !== word._id.toString());
    user.words = updatedWords;
    await user.save();
    return res.status(201).json({
      message: "Successful!"
    });
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }
}