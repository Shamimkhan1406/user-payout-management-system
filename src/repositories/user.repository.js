const prisma = require("../config/prisma");

class UserRepository {
    async create(data) {
        return prisma.user.create({
            data,
        });
    }

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username) {
        return prisma.user.findUnique({
            where: { username },
        });
    }
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
}

module.exports = new UserRepository();