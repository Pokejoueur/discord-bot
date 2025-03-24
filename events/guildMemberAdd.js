const generateWelcomeImage = require('../utils/generateWelcomeImage');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome'); // Change channel name if needed
        if (!welcomeChannel) return;

        const attachment = await generateWelcomeImage(member);
        welcomeChannel.send({ content: `🎉 Welcome <@${member.user.id}> to **${member.guild.name}**!`, files: [attachment] });
    }
};
