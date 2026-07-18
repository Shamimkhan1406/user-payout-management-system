const prisma = require("../src/config/prisma");

async function clearDatabase() {
    await prisma.ledger.deleteMany();
    await prisma.withdrawal.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.user.deleteMany();
}

module.exports = {
    clearDatabase,
    prisma,
};