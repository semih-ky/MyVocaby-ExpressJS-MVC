const express = require("express");
const router = express.Router();

const { getHome } = require("../controllers/home");
const { isAuth } = require("../middleware/isAuth");

router.get("/home", isAuth, getHome);

module.exports = router;