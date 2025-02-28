require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./src/eventHandler'); // Import du gestionnaire d'événements

// Créer une instance du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Charger les événements
eventHandler(client);

// Connexion au bot avec le token
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("Bot connecté avec succès"))
  .catch((err) => console.error("Erreur de connexion avec le bot: ", err));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.log("Erreur de connexion à MongoDB : ", err));
