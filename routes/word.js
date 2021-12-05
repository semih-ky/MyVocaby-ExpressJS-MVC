const express = require("express");
const router = express.Router();

const { saveWord, removeWord } = require("../controllers/word");

const { isAuth } = require("../middleware/isAuth");

router.post("/api/save-word", isAuth, saveWord);

router.post("/api/remove-word", isAuth, removeWord);

module.exports = router;