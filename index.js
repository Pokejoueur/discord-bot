require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const { setupAuditLogger } = require('./auditLogger'); // Import audit logger

// Créer une instance du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration, // Required for audit logs
  ],
});

// Charger les commandes
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

commandFiles.forEach(file => {
  const command = require(`./commands/${file}`);
  client.on('messageCreate', (message) => {
    if (message.content.toLowerCase() === `!${command.name}`) {
      command.execute(message);
    }
  });
});

const LOG_CHANNEL_ID = 'YOUR_CHANNEL_ID'; // Replace with your log channel ID

// When bot is ready, initialize audit log monitoring
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setupAuditLogger(client, LOG_CHANNEL_ID);
});

// Connexion au bot avec le token
client.login(process.env.DISCORD_TOKEN);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.log("Erreur de connexion à MongoDB : ", err));
