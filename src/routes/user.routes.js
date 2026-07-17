const express = require("express");
const controller = require("../controllers/user.controller");

const router = express.Router();

router.post("/", controller.create);

module.exports = router;