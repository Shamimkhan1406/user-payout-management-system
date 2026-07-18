const express = require("express");

const userRoutes = require("./user.routes");
const saleRoutes = require("./sale.routes");


const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API running",
  });
});

router.use("/users", userRoutes);
router.use("/sales", saleRoutes);


module.exports = router;