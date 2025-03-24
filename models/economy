const mongoose = require('mongoose');

const economySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    lastDaily: { type: Date, default: null }
});

module.exports = mongoose.model('Economy', economySchema);
