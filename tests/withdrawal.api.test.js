const request = require("supertest");
const app = require("../src/app");
const { prisma, clearDatabase } = require("./testUtils");
const { LedgerType, WithdrawalStatus } = require("@prisma/client");

describe("Withdrawal API", () => {
    let user;

    beforeEach(async () => {
        await clearDatabase();

        user = await prisma.user.create({
            data: {
                username: "john",
                email: "john@test.com",
            },
        });

        // Give the user ₹100 balance
        await prisma.ledger.create({
            data: {
                userId: user.id,
                type: LedgerType.FINAL_PAYOUT,
                amount: 100,
                description: "Test payout",
            },
        });
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    test("should create a withdrawal", async () => {
        const res = await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 50,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);

        const withdrawal = await prisma.withdrawal.findUnique({
            where: {
                id: res.body.data.id,
            },
        });

        expect(withdrawal).not.toBeNull();
        expect(withdrawal.status).toBe(WithdrawalStatus.PENDING);

        const ledger = await prisma.ledger.findFirst({
            where: {
                withdrawalId: withdrawal.id,
                type: LedgerType.WITHDRAWAL,
            },
        });

        expect(ledger).not.toBeNull();
        expect(Number(ledger.amount)).toBe(-50);
    });

    test("should reject withdrawal with insufficient balance", async () => {
        const res = await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 200,
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Insufficient balance");
    });

    test("should enforce 24 hour withdrawal restriction", async () => {
        await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 30,
            });

        const second = await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 20,
            });

        expect(second.statusCode).toBe(400);
        expect(second.body.message).toBe(
            "Withdrawal allowed only once every 24 hours"
        );
    });

    test("should recover amount when withdrawal fails", async () => {
        const create = await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 40,
            });

        await request(app)
            .patch(`/api/withdrawals/${create.body.data.id}/status`)
            .send({
                status: WithdrawalStatus.FAILED,
            });

        const recovery = await prisma.ledger.findFirst({
            where: {
                withdrawalId: create.body.data.id,
                type: LedgerType.FAILED_RECOVERY,
            },
        });

        expect(recovery).not.toBeNull();
        expect(Number(recovery.amount)).toBe(40);
    });

    test("should recover amount when withdrawal is cancelled", async () => {
        const create = await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 40,
            });

        await request(app)
            .patch(`/api/withdrawals/${create.body.data.id}/status`)
            .send({
                status: WithdrawalStatus.CANCELLED,
            });

        const recovery = await prisma.ledger.findFirst({
            where: {
                withdrawalId: create.body.data.id,
                type: LedgerType.FAILED_RECOVERY,
            },
        });

        expect(recovery).not.toBeNull();
        expect(Number(recovery.amount)).toBe(40);
    });

    test("should recover amount when withdrawal is rejected", async () => {
        const create = await request(app)
            .post("/api/withdrawals")
            .send({
                userId: user.id,
                amount: 40,
            });

        await request(app)
            .patch(`/api/withdrawals/${create.body.data.id}/status`)
            .send({
                status: WithdrawalStatus.REJECTED,
            });

        const recovery = await prisma.ledger.findFirst({
            where: {
                withdrawalId: create.body.data.id,
                type: LedgerType.FAILED_RECOVERY,
            },
        });

        expect(recovery).not.toBeNull();
        expect(Number(recovery.amount)).toBe(40);
    });
});