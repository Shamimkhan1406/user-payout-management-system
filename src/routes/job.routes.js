const express = require("express");
const controller = require("../controllers/job.controller");

const router = express.Router();

router.post("/advance-payout", controller.runAdvancePayout);

module.exports = router;