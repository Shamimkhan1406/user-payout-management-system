const prisma = require("../config/prisma");
const saleRepository = require("../repositories/sale.repository");
const ledgerRepository = require("../repositories/ledger.repository");

class AdvancePayoutService {
    async processAdvancePayouts() {
        const sales = await saleRepository.findEligibleSales();

        console.log("Eligible Sales:", sales);

        let processed = 0;

        for (const sale of sales) {
            const paid = await this.processSale(sale);

            if (paid) processed++;
        }

        return { processed };
    }

    async processSale(sale) {
        const idempotencyKey = `ADVANCE_${sale.id}`;

        const existing =
            await ledgerRepository.findByIdempotencyKey(idempotencyKey);

        if (existing) {
            return false;
        }

        const advanceAmount = Number(sale.earning) * 0.1;

        await prisma.$transaction(async (tx) => {
            await ledgerRepository.create(
                {
                    userId: sale.userId,
                    saleId: sale.id,
                    type: "ADVANCE_PAYOUT",
                    amount: advanceAmount,
                    description: "10% advance payout",
                    idempotencyKey,
                },
                tx
            );

            await saleRepository.update(
                sale.id,
                {
                    advancePaid: true,
                    advanceAmount,
                },
                tx
            );
        });
        return true;
    }
}

module.exports = new AdvancePayoutService();