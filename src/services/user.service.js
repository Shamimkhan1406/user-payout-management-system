const userRepository = require("../repositories/user.repository");

class UserService {
  async createUser({ username, email }) {
    const existingEmail = await userRepository.findByEmail(email);

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const existingUsername =
      await userRepository.findByUsername(username);

    if (existingUsername) {
      throw new Error("Username already exists");
    }

    return userRepository.create({
      username,
      email,
    });
  }
}

module.exports = new UserService();