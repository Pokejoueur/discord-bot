const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../../models/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async execute(interaction) {
        const user = await Economy.findOne({ userId: interaction.user.id }) || new Economy({ userId: interaction.user.id });
        await user.save();
        
        await interaction.reply(`💰 **${interaction.user.username}**, you have **${user.balance} coins**.`);
    }
};
