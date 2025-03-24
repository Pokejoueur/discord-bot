const { SlashCommandBuilder } = require('discord.js');
const Giveaway = require('../../models/giveaway');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-start')
        .setDescription('Start a giveaway')
        .addStringOption(option => option.setName('prize').setDescription('Prize of the giveaway').setRequired(true))
        .addIntegerOption(option => option.setName('winners').setDescription('Number of winners').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Duration in minutes').setRequired(true)),
    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const winners = interaction.options.getInteger('winners');
        const duration = interaction.options.getInteger('duration');

        const giveawayMessage = await interaction.channel.send(`🎉 **Giveaway Started!** 🎉\n🎁 Prize: **${prize}**\n🏆 Winners: **${winners}**\n⏳ Ends in: **${duration} minutes**\n\nReact with 🎉 to enter!`);
        await giveawayMessage.react('🎉');

        const giveaway = new Giveaway({
            messageId: giveawayMessage.id,
            channelId: interaction.channel.id,
            prize,
            winners,
            endsAt: new Date(Date.now() + duration * 60 * 1000)
        });

        await giveaway.save();
        await interaction.reply({ content: 'Giveaway started!', ephemeral: true });
    }
};
