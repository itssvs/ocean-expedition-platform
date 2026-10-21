const User = require('../models/User');

// List users (without passwords) so the client can fill dropdowns
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role specialization');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
