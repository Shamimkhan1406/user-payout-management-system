const express = require("express");

const userRoutes = require("./user.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API running",
  });
});

router.use("/users", userRoutes);

module.exports = router;