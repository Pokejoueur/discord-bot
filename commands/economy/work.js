const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../../models/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn coins'),
    async execute(interaction) {
        const earnings = Math.floor(Math.random() * 200) + 50;
        const user = await Economy.findOne({ userId: interaction.user.id }) || new Economy({ userId: interaction.user.id });

        user.balance += earnings;
        await user.save();

        await interaction.reply(`💼 **${interaction.user.username}**, you worked and earned **${earnings} coins**!`);
    }
};
