// commands/welcome.js
module.exports = {
  name: 'welcome',
  description: 'Message de bienvenue à un nouveau membre',
  execute(client) {
    client.on('guildMemberAdd', (member) => {
      const channel = member.guild.channels.cache.find(ch => ch.name === '📑│welcome-lobby'); // ou un autre canal spécifique
      if (!channel) return;
      channel.send(`Bienvenue sur le serveur, ${member.user.tag}! 🎉`);
    });
  },
};
