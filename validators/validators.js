const { body } = require("express-validator");

exports.signupValidator = [
  body("username")
  .trim().isLength({ min: 3 }).withMessage("username should be at least 3 char!")
  .isAlphanumeric().withMessage("username must be alphanumeric!"),
  body("password")
  .trim().isLength({ min: 8 }).withMessage("password should be at least 8 char!"),
  body("rePassword")
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }
    return true;
  })
];

exports.wordValidator = [
  body("word")
  .isAlpha().withMessage("Word must be only contains [A-Z][a-z]!")
]

exports.quizValidator = [
  body("numberOfQuestions")
  .isInt({ min: 1 }).withMessage("numberOfQuestions must be digit at start: 1")
]