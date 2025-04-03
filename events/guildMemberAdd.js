const { generateWelcomeImage } = require('../utils/welcomeImage');
const { WELCOME_CHANNEL_ID } = require('../config');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (!channel) return;

        const welcomeImage = await generateWelcomeImage(member.user.username, member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        channel.send({ content: `Welcome to the server, ${member}! 🎉`, files: [welcomeImage] });
    }
};
