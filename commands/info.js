module.exports = {
  name: 'info',
  description: 'Donne des informations sur le serveur.',
  execute(message) {
    message.channel.send(
      `**Bienvenue sur le serveur Discord de *Poke-GAMES*!** 🎮

Créé le **[insérer la date]**, *Poke-GAMES* est un groupe passionné par la création de jeux Roblox uniques. Rejoignez-nous pour découvrir nos projets en cours, dont :

1. **[Nom du jeu]** - *[lien Roblox]*
2. **[Nom du jeu]** - *[lien Roblox]*

**Nos Leaders** :
- **Pokejoueur** – *Leader & Project Leader* 🎮
- **Dralex** – *Project Assistant / Second* 🧠

Rejoignez l’aventure et découvrez des jeux captivants ! On vous attend sur Roblox ! 🚀`
    );
  },
};
