const request = require("supertest");
const app = require("../src/app");
const { prisma, clearDatabase } = require("./testUtils");

describe("Sale API", () => {
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

    test("should create a sale", async () => {
        const res = await request(app)
            .post("/api/sales")
            .send({
                userId: user.id,
                brand: "Amazon",
                earning: 100,
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);

        expect(res.body.data.brand).toBe("Amazon");
        expect(Number(res.body.data.earning)).toBe(100);
        expect(res.body.data.status).toBe("PENDING");
        expect(res.body.data.advancePaid).toBe(false);

        const sale = await prisma.sale.findUnique({
            where: {
                id: res.body.data.id,
            },
        });

        expect(sale).not.toBeNull();
        expect(sale.brand).toBe("Amazon");
    });

    test("should reject sale for invalid user", async () => {
        const res = await request(app)
            .post("/api/sales")
            .send({
                userId: "550e8400-e29b-41d4-a716-446655440000",
                brand: "Amazon",
                earning: 100,
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("User not found");
    });

    test("should reject invalid request body", async () => {
        const res = await request(app)
            .post("/api/sales")
            .send({
                userId: user.id,
                brand: "",
                earning: -100,
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});