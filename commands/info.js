module.exports = (client) => {
  // Quand le bot est prêt
  client.once('ready', () => {
    console.log(`Le bot est connecté et prêt !`);
  });

  // Quand un message est reçu
  client.on('messageCreate', (message) => {
    // Empêcher que le bot réponde à ses propres messages
    if (message.author.bot) return;

    // Commande !info
    if (message.content.toLowerCase() === '!info') {
      // Création du message d'information sur Poke-GAMES
      const infoMessage = `
**Bienvenue sur le serveur Discord de *Poke-GAMES*!** 🎮

Créé en **août 2022**, *Poke-GAMES* est un groupe passionné par la création de jeux Roblox uniques. Rejoignez-nous pour découvrir nos projets en cours, dont :

1. **Goku's Legendary Adventure** - *[https://www.roblox.com/games/12281203521/Gokus-Legendary-Adventure]*
2. **Soon ...**

**Nos Leaders** :
- **Pokejoueur** – *Leader & Project Leader* 🎮
- **Dralex** – *Project Assistant* 🧠

Rejoignez l’aventure et découvrez des jeux captivants ! On vous attend sur Roblox ! 🚀
`;

      // Envoyer le message dans le canal où la commande a été exécutée
      message.channel.send(infoMessage);
    }
  });
};

// Connexion avec le token du bot depuis le fichier .env
client.login(process.env.DISCORD_TOKEN);