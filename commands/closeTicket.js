const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../models/tickets');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Close your support ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const { channel, user } = interaction;
        const ticket = await Ticket.findOne({ channelId: channel.id });

        if (!ticket) return interaction.reply({ content: "This is not a valid ticket channel.", ephemeral: true });

        await Ticket.deleteOne({ channelId: channel.id });
        await channel.delete();
    }
};
