const reconciliationService = require("../services/reconciliation.service");

class ReconciliationController {
    async reconcileSale(req, res) {
        try {
            const result = await reconciliationService.reconcileSale(req.body);

            return res.status(200).json({
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

module.exports = new ReconciliationController();