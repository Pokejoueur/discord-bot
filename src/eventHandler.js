module.exports = (client) => {
  client.once('ready', () => {
    console.log('Le bot est connecté et prêt !');
  });

  // Quand un message est reçu
  client.on('messageCreate', (message) => {
    // Empêcher que le bot réponde à ses propres messages
    if (message.author.bot) return;

    // Logique pour commander des commandes, à gérer dans des fichiers séparés (ex: command/)
  });
};
