const prisma = require("../config/prisma");
const ledgerRepository = require("../repositories/ledger.repository");
const withdrawalRepository = require("../repositories/withdrawal.repository");

class WithdrawalService {
    async createWithdrawal({ userId, amount }) {
        // Calculate available balance
        const balance = await ledgerRepository.getUserBalance(userId);

        if (balance < amount) {
            throw new Error("Insufficient balance");
        }

        // Check 24-hour restriction
        const lastWithdrawal =
            await withdrawalRepository.findLatestByUser(userId);

        if (lastWithdrawal) {
            const lastTime = new Date(lastWithdrawal.createdAt);
            const now = new Date();

            const diffHours =
                (now - lastTime) / (1000 * 60 * 60);

            if (diffHours < 24) {
                throw new Error(
                    "Withdrawal allowed only once every 24 hours"
                );
            }
        }

        // Transaction
        return prisma.$transaction(async (tx) => {
            const withdrawal =
                await withdrawalRepository.create(
                    {
                        userId,
                        amount,
                        status: "PENDING",
                    },
                    tx
                );

            await ledgerRepository.create(
                {
                    userId,
                    withdrawalId: withdrawal.id,
                    type: "WITHDRAWAL",
                    amount: -amount,
                    description: "Withdrawal request",
                },
                tx
            );

            return withdrawal;
        });
    }
    async updateWithdrawalStatus(id, status) {
        const withdrawal =
            await withdrawalRepository.findById(id);

        if (!withdrawal) {
            throw new Error("Withdrawal not found");
        }

        if (withdrawal.status !== "PENDING") {
            throw new Error("Withdrawal already processed");
        }

        await prisma.$transaction(async (tx) => {
            await withdrawalRepository.update(
                id,
                {
                    status,
                    processedAt: new Date(),
                },
                tx
            );

            if (
                ["FAILED", "CANCELLED", "REJECTED"].includes(status)
            ) {
                const recovery =
                    await withdrawalRepository.findRecoveryEntry(id);

                if (!recovery) {
                    await ledgerRepository.create(
                        {
                            userId: withdrawal.userId,
                            withdrawalId: withdrawal.id,
                            type: "FAILED_RECOVERY",
                            amount: withdrawal.amount,
                            description:
                                "Withdrawal recovery",
                        },
                        tx
                    );
                }
            }
        });

        return {
            message: `Withdrawal marked as ${status}`,
        };
    }
}

module.exports = new WithdrawalService();