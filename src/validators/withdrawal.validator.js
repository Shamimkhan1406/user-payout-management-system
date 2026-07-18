const { z } = require("zod");

const createWithdrawalSchema = z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
});

module.exports = {
    createWithdrawalSchema,
};