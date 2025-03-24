const { SlashCommandBuilder } = require('discord.js');
const XP = require('../../models/xp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your level'),
    async execute(interaction) {
        const user = await XP.findOne({ userId: interaction.user.id }) || new XP({ userId: interaction.user.id });

        await interaction.reply(`📊 **${interaction.user.username}**, you are Level **${user.level}** with **${user.xp} XP**.`);
    }
};
