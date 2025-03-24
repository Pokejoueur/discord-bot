const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../models/tickets');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Open a support ticket'),
    
    async execute(interaction) {
        const { guild, user } = interaction;

        // Check if user already has a ticket
        const existingTicket = await Ticket.findOne({ userId: user.id });
        if (existingTicket) {
            return interaction.reply({ content: "You already have an open ticket!", ephemeral: true });
        }

        // Create a ticket channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: 0, // Text channel
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                }
            ]
        });

        // Save ticket to database
        await Ticket.create({ userId: user.id, channelId: ticketChannel.id });

        await interaction.reply({ content: `🎫 Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    }
};
