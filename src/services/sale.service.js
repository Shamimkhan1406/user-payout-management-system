const saleRepository = require("../repositories/sale.repository");
const prisma = require("../config/prisma");

class SaleService {
  async createSale({ userId, brand, earning }) {
    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

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