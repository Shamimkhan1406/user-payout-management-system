const prisma = require("../config/prisma");

class SaleRepository {
    async create(data) {
        return prisma.sale.create({
            data,
        });
    }

    async findById(id) {
        return prisma.sale.findUnique({
            where: { id },
        });
    }

    async findEligibleSales() {
        return prisma.sale.findMany({
            where: {
                status: "PENDING",
                advancePaid: false,
            },
        });
    }
    async update(id, data, db = prisma) {
        return db.sale.update({
            where: { id },
            data,
        });
    }
    async findById(id) {
        return prisma.sale.findUnique({
            where: { id },
        });
    }
    async reconcileSale(id, status, db = prisma) {
        return db.sale.update({
            where: { id },
            data: {
                status,
                reconciledAt: new Date(),
            },
        });
    }
}

module.exports = new SaleRepository();