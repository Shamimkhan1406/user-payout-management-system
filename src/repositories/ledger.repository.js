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
}

module.exports = new LedgerRepository();