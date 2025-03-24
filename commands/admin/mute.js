const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a member.')
        .addUserOption(option => option.setName('target').setDescription('The user to mute').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Mute duration in minutes').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ You don’t have permission to mute members!', ephemeral: true });
        }

        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');

        try {
            const member = await interaction.guild.members.fetch(target.id);
            await member.timeout(duration * 60 * 1000);
            await interaction.reply(`✅ **${target.tag}** has been muted for ${duration} minutes!`);
        } catch (error) {
            await interaction.reply({ content: '❌ Unable to mute the user.', ephemeral: true });
        }
    }
};
