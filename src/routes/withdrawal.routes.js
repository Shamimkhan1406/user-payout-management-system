const express = require("express");

const controller = require("../controllers/withdrawal.controller");
const validate = require("../middleware/validate");
const { updateWithdrawalSchema, } = require("../validators/updateWithdrawal.validator");
const { createWithdrawalSchema, } = require("../validators/withdrawal.validator");

const router = express.Router();

router.post(
    "/",
    validate(createWithdrawalSchema),
    controller.createWithdrawal
);

router.patch(
    "/:id/status",
    validate(updateWithdrawalSchema),
    controller.updateWithdrawalStatus
);

module.exports = router;