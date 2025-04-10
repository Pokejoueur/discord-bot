require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  Events, 
  Collection, 
  EmbedBuilder, 
  PermissionsBitField 
} = require('discord.js');
const mongoose = require('mongoose');

// Initialize client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages
  ]
});

// Status presence
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'PokeDral v1.0', type: ActivityType.Watching }],
    status: 'online'
  });
});

// MongoDB models
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  points: { type: Number, default: 0 },
  pendingPoints: { type: Number, default: 0 },
  invitedUsers: [{ type: String }]
});

const ConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  verificationPeriod: { type: Number, default: 7 * 24 * 60 * 60 * 1000 },
  notificationChannelId: { type: String, default: null }
});

const User = mongoose.model('User', UserSchema);
const Config = mongoose.model('Config', ConfigSchema);

// Invite cache
const invitesCache = new Collection();

// MongoDB connection with retry
function connectToMongoDB() {
  if (!process.env.MONGODB_URI) return console.error('Missing MONGODB_URI in .env');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB error:', err);
      setTimeout(connectToMongoDB, 5000);
    });
}
connectToMongoDB();

mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
  setTimeout(connectToMongoDB, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Reconnecting...');
  setTimeout(connectToMongoDB, 5000);
});

// Slash commands list
const commands = [/* your commands go here (points, admin-points, config, leaderboard) */];

// Register command collection
client.commands = new Collection();
commands.forEach(cmd => client.commands.set(cmd.name, cmd));

// Client ready
client.once(Events.ClientReady, async () => {
  console.log(`Bot is online as ${client.user.tag}`);
  for (const guild of client.guilds.cache.values()) {
    try {
      const guildInvites = await guild.invites.fetch().catch(() => new Collection());
      invitesCache.set(guild.id, new Collection(guildInvites.map(i => [i.code, i.uses])));
    } catch (err) {
      console.error(`Invite fetch failed for ${guild.name}`, err);
    }
  }

  try {
    await client.application?.commands.set(commands.map(c => ({
      name: c.name,
      description: c.description,
      options: c.options || []
    })));
    console.log('Slash commands registered.');
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
});

// ... (rest of your bot events like InviteCreate, GuildCreate, command execution, etc.)

// Login
client.login(process.env.TOKEN);
