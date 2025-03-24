const { SlashCommandBuilder } = require('discord.js');
const Giveaway = require('../../models/giveaway');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-join')
        .setDescription('Join a giveaway')
        .addStringOption(option => option.setName('messageid').setDescription('Message ID of the giveaway').setRequired(true)),
    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');
        const giveaway = await Giveaway.findOne({ messageId });

        if (!giveaway) return interaction.reply('❌ Giveaway not found.');

        if (giveaway.participants.includes(interaction.user.id)) {
            return interaction.reply('❌ You are already in this giveaway.');
        }

        giveaway.participants.push(interaction.user.id);
        await giveaway.save();

        await interaction.reply('✅ You joined the giveaway!');
    }
};
