const { z } = require("zod");

const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30),

  email: z.email("Invalid email address"),
});

module.exports = {
  createUserSchema,
};