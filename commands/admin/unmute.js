const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmutes a member.')
        .addUserOption(option => option.setName('target').setDescription('The user to unmute').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ You don’t have permission to unmute members!', ephemeral: true });
        }

        const target = interaction.options.getUser('target');

        try {
            const member = await interaction.guild.members.fetch(target.id);
            await member.timeout(null);
            await interaction.reply(`✅ **${target.tag}** has been unmuted!`);
        } catch (error) {
            await interaction.reply({ content: '❌ Unable to unmute the user.', ephemeral: true });
        }
    }
};
