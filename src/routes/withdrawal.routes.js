const express = require("express");

const controller = require("../controllers/withdrawal.controller");
const validate = require("../middleware/validate");
const {
    createWithdrawalSchema,
} = require("../validators/withdrawal.validator");

const router = express.Router();

router.post(
    "/",
    validate(createWithdrawalSchema),
    controller.createWithdrawal
);

module.exports = router;