const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confess')
        .setDescription('Send an anonymous confession')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The confession message')
                .setRequired(true)),
    
    async execute(interaction) {
        const confessionChannel = interaction.guild.channels.cache.find(ch => ch.name === 'confessions');
        if (!confessionChannel) return interaction.reply({ content: "Confession channel not found!", ephemeral: true });

        const confession = interaction.options.getString('message');

        confessionChannel.send(`💌 **Anonymous Confession:**\n${confession}`);
        await interaction.reply({ content: "Your confession has been sent anonymously!", ephemeral: true });
    }
};
