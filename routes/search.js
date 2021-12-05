const express = require("express");
const router = express.Router();

const { wordValidator } = require("../validators/validators");

const { search } = require("../controllers/search");

const { isAuth } = require("../middleware/isAuth");

router.post("/api/search", isAuth, wordValidator, search);

module.exports = router;