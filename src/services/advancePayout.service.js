const prisma = require("../config/prisma");
const saleRepository = require("../repositories/sale.repository");
const ledgerRepository = require("../repositories/ledger.repository");

class AdvancePayoutService {
  async processAdvancePayouts() {
    const sales = await saleRepository.findEligibleSales();

    for (const sale of sales) {
      await this.processSale(sale);
    }

    return {
      processed: sales.length,
    };
  }

  async processSale(sale) {
    const idempotencyKey = `ADVANCE_${sale.id}`;

    const existing =
      await ledgerRepository.findByIdempotencyKey(idempotencyKey);

    if (existing) {
      return;
    }

    const advanceAmount = Number(sale.earning) * 0.1;

    await prisma.$transaction(async (tx) => {
      await tx.ledger.create({
        data: {
          userId: sale.userId,
          saleId: sale.id,
          type: "ADVANCE_PAYOUT",
          amount: advanceAmount,
          description: "10% advance payout",
          idempotencyKey,
        },
      });

      await tx.sale.update({
        where: {
          id: sale.id,
        },
        data: {
          advancePaid: true,
          advanceAmount,
        },
      });
    });
  }
}

module.exports = new AdvancePayoutService();