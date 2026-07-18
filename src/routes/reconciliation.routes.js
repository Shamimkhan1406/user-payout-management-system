const express = require("express");

const controller = require("../controllers/reconciliation.controller");
const validate = require("../middleware/validate");
const {
    reconcileSaleSchema,
} = require("../validators/reconciliation.validator");

const router = express.Router();

router.post(
    "/",
    validate(reconcileSaleSchema),
    controller.reconcileSale
);

module.exports = router;