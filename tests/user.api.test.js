const request = require("supertest");
const app = require("../src/app");
const { prisma, clearDatabase } = require("./testUtils");

describe("User API", () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    test("should create a new user", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({
                username: "john_doe",
                email: "john@test.com",
            });

        expect(res.statusCode).toBe(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.username).toBe("john_doe");
        expect(res.body.data.email).toBe("john@test.com");

        const user = await prisma.user.findUnique({
            where: {
                email: "john@test.com",
            },
        });

        expect(user).not.toBeNull();
        expect(user.username).toBe("john_doe");
    });

    test("should reject duplicate email", async () => {
        await request(app)
            .post("/api/users")
            .send({
                username: "john",
                email: "john@test.com",
            });

        const res = await request(app)
            .post("/api/users")
            .send({
                username: "another",
                email: "john@test.com",
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email already exists");
    });

    test("should reject duplicate username", async () => {
        await request(app)
            .post("/api/users")
            .send({
                username: "john",
                email: "john@test.com",
            });

        const res = await request(app)
            .post("/api/users")
            .send({
                username: "john",
                email: "another@test.com",
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Username already exists");
    });
});