const { Events } = require("discord.js");

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const goodbyeChannel = member.guild.channels.cache.find(channel => channel.name === "goodbye");
        if (!goodbyeChannel) return;

        goodbyeChannel.send(`❌ **${member.user.tag}** has left the server.`);
    }
};
