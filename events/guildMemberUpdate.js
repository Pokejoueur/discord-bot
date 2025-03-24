const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channel = member.guild.channels.cache.find(ch => ch.name.includes("Members:"));
        if (channel) {
            channel.setName(`Members: ${member.guild.memberCount}`);
        }
    }
};
