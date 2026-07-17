const userService = require("../services/user.service");

class UserController {
  async create(req, res) {
    try {
      const user = await userService.createUser(req.body);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UserController();