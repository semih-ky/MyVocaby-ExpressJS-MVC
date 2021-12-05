const User = require("../models/user");

exports.getHome = async (req, res, next) => {
  try {
    let user = await User.findById(req.session.user._id).populate("words.word");
    user.words.sort((item1, item2) => item2.history - item1.history);
    return res.render("home", {
      wordList: user.words
    });
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }
}