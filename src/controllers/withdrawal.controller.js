const withdrawalService = require("../services/withdrawal.service");

class WithdrawalController {
    async createWithdrawal(req, res) {
        try {
            const result = await withdrawalService.createWithdrawal(req.body);

            return res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

module.exports = new WithdrawalController();