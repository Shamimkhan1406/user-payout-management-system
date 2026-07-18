const { z } = require("zod");

const updateWithdrawalSchema = z.object({
    status: z.enum([
        "SUCCESS",
        "FAILED",
        "CANCELLED",
        "REJECTED",
    ]),
});

module.exports = {
    updateWithdrawalSchema,
};