const advancePayoutService = require("../services/advancePayout.service");

class JobController {
  async runAdvancePayout(req, res) {
    try {
      const result = await advancePayoutService.processAdvancePayouts();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new JobController();