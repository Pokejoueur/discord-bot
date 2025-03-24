const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    guildId: String,
    messagesSent: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 }, // In seconds
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stat', statSchema);
