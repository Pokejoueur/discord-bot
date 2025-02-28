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
      const infoMessage = `
**Bienvenue sur le serveur Discord de *Poke-GAMES*!** 🎮

Créé le **01 janvier 2020**, *Poke-GAMES* est un groupe passionné par la création de jeux Roblox uniques. Rejoignez-nous pour découvrir nos projets en cours, dont :

1. **Super Aventure** - *[https://roblox.com/games/123456789/Super-Aventure]*
2. **Aventure Épique** - *[https://roblox.com/games/987654321/Aventure-Epique]*

**Nos Leaders** :
- **Pokejoueur** – *Leader & Project Leader* 🎮
- **Dralex** – *Project Assistant / Second* 🧠

Rejoignez l’aventure et découvrez des jeux captivants ! On vous attend sur Roblox ! 🚀
`;

      message.channel.send(infoMessage);
    }
  });
};
