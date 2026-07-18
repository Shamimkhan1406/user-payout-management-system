const prisma = require("../config/prisma");
const saleRepository = require("../repositories/sale.repository");
const ledgerRepository = require("../repositories/ledger.repository");

class ReconciliationService {
    async reconcileSale({ saleId, status }) {
        const sale = await saleRepository.findById(saleId);

        if (!sale) {
            throw new Error("Sale not found");
        }

        if (sale.status !== "PENDING") {
            throw new Error("Sale has already been reconciled");
        }

        const ledgerType =
            status === "APPROVED"
                ? "FINAL_PAYOUT"
                : "ADVANCE_REVERSAL";

        const existing = await ledgerRepository.findBySaleAndType(
            sale.id,
            ledgerType
        );

        if (existing) {
            throw new Error("Sale already reconciled");
        }

        await prisma.$transaction(async (tx) => {
            if (status === "APPROVED") {
                const finalAmount =
                    Number(sale.earning) - Number(sale.advanceAmount);

                await ledgerRepository.create(
                    {
                        userId: sale.userId,
                        saleId: sale.id,
                        type: "FINAL_PAYOUT",
                        amount: finalAmount,
                        description: "Final payout after reconciliation",
                    },
                    tx
                );
            } else {
                if (Number(sale.advanceAmount) > 0) {
                    await ledgerRepository.create(
                        {
                            userId: sale.userId,
                            saleId: sale.id,
                            type: "ADVANCE_REVERSAL",
                            amount: -Number(sale.advanceAmount),
                            description: "Advance payout reversal",
                        },
                        tx
                    );
                }
            }

            await saleRepository.reconcileSale(
                sale.id,
                status,
                tx
            );
        });

        return {
            message: `Sale ${status.toLowerCase()} successfully`,
        };
    }
}


module.exports = new ReconciliationService();