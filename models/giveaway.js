const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    prize: { type: String, required: true },
    winners: { type: Number, required: true },
    endsAt: { type: Date, required: true },
    participants: { type: [String], default: [] }
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
