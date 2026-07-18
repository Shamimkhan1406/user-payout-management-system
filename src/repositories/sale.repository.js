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
}

module.exports = new SaleRepository();