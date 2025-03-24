const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server.')
        .addUserOption(option => option.setName('target').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for ban')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: '❌ You don’t have permission to ban members!', ephemeral: true });
        }

        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(target, { reason });
            await interaction.reply(`✅ **${target.tag}** has been banned! Reason: ${reason}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Unable to ban the user.', ephemeral: true });
        }
    }
};
