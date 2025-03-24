const { Events } = require('discord.js');
const Stat = require('../models/stats');
const activeUsers = new Map();

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const userId = newState.member.id;
        const guildId = newState.guild.id;

        if (newState.channelId) {
            activeUsers.set(userId, Date.now());
        } else if (oldState.channelId && activeUsers.has(userId)) {
            const startTime = activeUsers.get(userId);
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            let stat = await Stat.findOne({ guildId });
            if (!stat) {
                stat = await Stat.create({ guildId });
            }

            stat.voiceTime += timeSpent;
            stat.updatedAt = Date.now();
            await stat.save();
            activeUsers.delete(userId);
        }
    }
          };
