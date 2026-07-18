const { z } = require("zod");

const createSaleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),

  brand: z.string().trim().min(1, "Brand is required"),

  earning: z.coerce
    .number()
    .positive("Earning must be greater than 0"),
});

module.exports = {
  createSaleSchema,
};