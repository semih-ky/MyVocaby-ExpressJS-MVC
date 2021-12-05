const express = require("express");
const router = express.Router();

const { isAuth } = require("../middleware/isAuth");
const { getQuiz, postQuiz } = require("../controllers/quiz");
const { quizValidator } = require("../validators/validators");

router.get("/quiz", isAuth, getQuiz);

router.post("/api/questions", isAuth, quizValidator, postQuiz);

module.exports = router;