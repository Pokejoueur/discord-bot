const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../../models/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    async execute(interaction) {
        const user = await Economy.findOne({ userId: interaction.user.id }) || new Economy({ userId: interaction.user.id });

        const now = new Date();
        if (user.lastDaily && now - user.lastDaily < 24 * 60 * 60 * 1000) {
            return interaction.reply('❌ You already claimed your daily reward today. Try again tomorrow!');
        }

        user.balance += 100;
        user.lastDaily = now;
        await user.save();

        await interaction.reply(`🎉 **${interaction.user.username}**, you claimed your daily reward of **100 coins**!`);
    }
};
