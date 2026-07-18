const prisma = require("../config/prisma");

class WithdrawalRepository {
    async create(data, db = prisma) {
        return db.withdrawal.create({
            data,
        });
    }

    async findLatestByUser(userId) {
        return prisma.withdrawal.findFirst({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findById(id) {
        return prisma.withdrawal.findUnique({
            where: { id },
        });
    }

    async update(id, data, db = prisma) {
        return db.withdrawal.update({
            where: { id },
            data,
        });
    }
    async findRecoveryEntry(withdrawalId) {
        return prisma.ledger.findFirst({
            where: {
                withdrawalId,
                type: "FAILED_RECOVERY",
            },
        });
    }
}

module.exports = new WithdrawalRepository();