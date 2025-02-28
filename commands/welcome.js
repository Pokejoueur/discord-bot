module.exports = {
  name: 'welcome',
  description: 'Gère le message de bienvenue lorsque quelqu’un rejoint le serveur.',
  execute(client) {
    // Quand un nouvel utilisateur rejoint le serveur
    client.on('guildMemberAdd', (member) => {
      // Récupérer le canal de bienvenue
      const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'bienvenue'); // Remplace 'bienvenue' par le nom de ton canal

      if (!welcomeChannel) return;

      // Message de bienvenue
      welcomeChannel.send(`Bienvenue sur le serveur, ${member.user.tag} ! 🎉`);
    });
  }
};
