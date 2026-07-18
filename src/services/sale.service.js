const saleRepository = require("../repositories/sale.repository");
const userRepository = require("../repositories/user.repository");

class SaleService {
  async createSale({ userId, brand, earning }) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return saleRepository.create({
      userId,
      brand,
      earning,
    });
  }
}

module.exports = new SaleService();