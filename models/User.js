const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  level: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
