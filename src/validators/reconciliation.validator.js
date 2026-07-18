const { z } = require("zod");

const reconcileSaleSchema = z.object({
    saleId: z.string().uuid(),
    status: z.enum(["APPROVED", "REJECTED"]),
});

module.exports = {
    reconcileSaleSchema,
};