const request = require("supertest");
const app = require("../src/app");
const { prisma, clearDatabase } = require("./testUtils");
const { LedgerType } = require("@prisma/client");

describe("Advance Payout API", () => {
    let user;

    beforeEach(async () => {
        await clearDatabase();

        user = await prisma.user.create({
            data: {
                username: "john",
                email: "john@test.com",
            },
        });
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    test("should process advance payouts for eligible sales", async () => {
        const sale1 = await prisma.sale.create({
            data: {
                userId: user.id,
                brand: "Amazon",
                earning: 100,
            },
        });

        const sale2 = await prisma.sale.create({
            data: {
                userId: user.id,
                brand: "Flipkart",
                earning: 200,
            },
        });

        const res = await request(app)
            .post("/api/jobs/advance-payout");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.processed).toBe(2);

        const updatedSale1 = await prisma.sale.findUnique({
            where: { id: sale1.id },
        });

        const updatedSale2 = await prisma.sale.findUnique({
            where: { id: sale2.id },
        });

        expect(updatedSale1.advancePaid).toBe(true);
        expect(Number(updatedSale1.advanceAmount)).toBe(10);

        expect(updatedSale2.advancePaid).toBe(true);
        expect(Number(updatedSale2.advanceAmount)).toBe(20);

        const ledgers = await prisma.ledger.findMany({
            where: {
                type: LedgerType.ADVANCE_PAYOUT,
            },
        });

        expect(ledgers).toHaveLength(2);
    });

    test("should not process already paid sales again", async () => {
        await prisma.sale.create({
            data: {
                userId: user.id,
                brand: "Amazon",
                earning: 100,
            },
        });

        await request(app)
            .post("/api/jobs/advance-payout");

        const secondRun = await request(app)
            .post("/api/jobs/advance-payout");

        expect(secondRun.statusCode).toBe(200);
        expect(secondRun.body.success).toBe(true);
        expect(secondRun.body.data.processed).toBe(0);

        const ledgers = await prisma.ledger.findMany({
            where: {
                type: LedgerType.ADVANCE_PAYOUT,
            },
        });

        expect(ledgers).toHaveLength(1);
    });
});