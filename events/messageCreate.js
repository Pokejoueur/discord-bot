const XP = require('../models/xp');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const user = await XP.findOne({ userId: message.author.id }) || new XP({ userId: message.author.id });

        const xpGain = Math.floor(Math.random() * 10) + 5;
        user.xp += xpGain;

        const nextLevelXP = user.level * 100;
        if (user.xp >= nextLevelXP) {
            user.xp = 0;
            user.level += 1;
            message.channel.send(`🎉 **${message.author.username}** leveled up to **Level ${user.level}**!`);
        }

        await user.save();
    }
};
