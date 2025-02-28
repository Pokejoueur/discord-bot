require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

// Créer une instance du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Importer et utiliser le gestionnaire d'événements
const eventHandler = require('./src/eventHandler');
eventHandler(client);

// Connexion au bot avec le token
client.login(process.env.DISCORD_TOKEN);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.log("Erreur de connexion à MongoDB : ", err));
