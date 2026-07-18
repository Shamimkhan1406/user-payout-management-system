const prisma = require("../config/prisma");

class LedgerRepository {
  async create(data) {
    return prisma.ledger.create({
      data,
    });
  }

  async findByIdempotencyKey(key) {
    return prisma.ledger.findUnique({
      where: {
        idempotencyKey: key,
      },
    });
  }
}

module.exports = new LedgerRepository();