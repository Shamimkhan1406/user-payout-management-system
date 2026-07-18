const express = require("express");

const controller = require("../controllers/sale.controller");
const validate = require("../middleware/validate");
const { createSaleSchema } = require("../validators/sale.validator");

const router = express.Router();

router.post(
  "/",
  validate(createSaleSchema),
  controller.create
);

module.exports = router;