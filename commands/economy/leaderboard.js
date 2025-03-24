const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../../models/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the richest players'),
    async execute(interaction) {
        const topUsers = await Economy.find().sort({ balance: -1 }).limit(10);

        if (topUsers.length === 0) {
            return interaction.reply('🏆 No users have earned money yet!');
        }

        const leaderboard = topUsers.map((user, index) => `**${index + 1}. <@${user.userId}>** - 💰 ${user.balance} coins`).join('\n');

        await interaction.reply(`🏆 **Top 10 Richest Users**:\n${leaderboard}`);
    }
};
