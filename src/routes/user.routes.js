const express = require("express");

const controller = require("../controllers/user.controller");
const validate = require("../middleware/validate");
const { createUserSchema } = require("../validators/user.validator");

const router = express.Router();

router.post(
  "/",
  validate(createUserSchema),
  controller.create
);

module.exports = router;