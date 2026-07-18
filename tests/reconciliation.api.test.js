const request = require("supertest");
const app = require("../src/app");
const { prisma, clearDatabase } = require("./testUtils");
const { LedgerType, SaleStatus } = require("@prisma/client");

describe("Reconciliation API", () => {
    let user;
    let sale;

    beforeEach(async () => {
        await clearDatabase();

        user = await prisma.user.create({
            data: {
                username: "john",
                email: "john@test.com",
            },
        });

        sale = await prisma.sale.create({
            data: {
                userId: user.id,
                brand: "Amazon",
                earning: 100,
            },
        });

        await request(app).post("/api/jobs/advance-payout");
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    test("should reconcile an approved sale", async () => {
        const res = await request(app)
            .post("/api/reconciliation")
            .send({
                saleId: sale.id,
                status: SaleStatus.APPROVED,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        const updatedSale = await prisma.sale.findUnique({
            where: { id: sale.id },
        });

        expect(updatedSale.status).toBe(SaleStatus.APPROVED);
        expect(updatedSale.reconciledAt).not.toBeNull();

        const finalPayout = await prisma.ledger.findFirst({
            where: {
                saleId: sale.id,
                type: LedgerType.FINAL_PAYOUT,
            },
        });

        expect(finalPayout).not.toBeNull();
        expect(Number(finalPayout.amount)).toBe(90);
    });

    test("should reconcile a rejected sale", async () => {
        const res = await request(app)
            .post("/api/reconciliation")
            .send({
                saleId: sale.id,
                status: SaleStatus.REJECTED,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        const updatedSale = await prisma.sale.findUnique({
            where: { id: sale.id },
        });

        expect(updatedSale.status).toBe(SaleStatus.REJECTED);

        const adjustment = await prisma.ledger.findFirst({
            where: {
                saleId: sale.id,
                type: LedgerType.REJECTED_ADJUSTMENT,
            },
        });

        expect(adjustment).not.toBeNull();
        expect(Number(adjustment.amount)).toBe(-10);
    });

    test("should not reconcile an already reconciled sale", async () => {
        await request(app)
            .post("/api/reconciliation")
            .send({
                saleId: sale.id,
                status: SaleStatus.APPROVED,
            });

        const second = await request(app)
            .post("/api/reconciliation")
            .send({
                saleId: sale.id,
                status: SaleStatus.REJECTED,
            });

        expect(second.statusCode).toBe(400);
        expect(second.body.success).toBe(false);
    });
});