const saleService = require("../services/sale.service");

class SaleController {
  async create(req, res) {
    try {
      const sale = await saleService.createSale(req.body);

      return res.status(201).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new SaleController();