module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const goodbyeChannel = member.guild.channels.cache.find(ch => ch.name === 'goodbye'); // Change channel name if needed
        if (!goodbyeChannel) return;

        goodbyeChannel.send(`😢 **${member.user.username}** has left the server. We'll miss you!`);
    }
};
