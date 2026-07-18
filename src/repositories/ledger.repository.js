const prisma = require("../config/prisma");

class LedgerRepository {
    async create(data, db = prisma) {
        return db.ledger.create({
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
    async findBySaleAndType(saleId, type) {
        return prisma.ledger.findFirst({
            where: {
                saleId,
                type,
            },
        });
    }
    async getUserBalance(userId) {
        const entries = await prisma.ledger.findMany({
            where: { userId },
            select: {
                amount: true,
            },
        });

        return entries.reduce(
            (sum, entry) => sum + Number(entry.amount),
            0
        );
    }
}

module.exports = new LedgerRepository();