const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroles')
        .setDescription('Create a reaction role message'),
    
    async execute(interaction) {
        const message = await interaction.channel.send("React to get roles:\n🔥 - Fire Role\n❄️ - Ice Role");

        await message.react('🔥');
        await message.react('❄️');

        process.env.ROLE_MESSAGE_ID = message.id; // Save for future reactions
        await interaction.reply({ content: "Reaction role message sent!", ephemeral: true });
    }
};
