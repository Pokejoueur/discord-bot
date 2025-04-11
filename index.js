require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  Events, 
  Collection, 
  PermissionsBitField 
} = require('discord.js');
const mongoose = require('mongoose');

// Initialize client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages
  ]
});

// Presence
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'PokeDral v1.0', type: ActivityType.Watching }],
    status: 'online'
  });
});

// MongoDB Models
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

// Connect to MongoDB
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

// Command list
const commands = [
  {
    name: 'points',
    description: 'Check your points',
    async execute(interaction) {
      const user = await User.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
      }) || { points: 0 };
      await interaction.reply(`${interaction.user.username}, you have ${user.points} points.`);
    }
  },
  {
    name: 'admin-points',
    description: 'Add points to a user (Admin only)',
    options: [
      {
        name: 'user',
        description: 'The user to add points to',
        type: 6,
        required: true
      },
      {
        name: 'amount',
        description: 'How many points to add',
        type: 4,
        required: true
      }
    ],
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return await interaction.reply({ content: 'You need to be an admin to use this.', ephemeral: true });
      }
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      const data = await User.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guild.id },
        { $inc: { points: amount } },
        { upsert: true, new: true }
      );
      await interaction.reply(`${target.username} now has ${data.points} points.`);
    }
  },
  {
    name: 'config',
    description: 'Set the verification period (in days)',
    options: [
      {
        name: 'days',
        description: 'Number of days',
        type: 4,
        required: true
      }
    ],
    async execute(interaction) {
      const days = interaction.options.getInteger('days');
      const config = await Config.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { verificationPeriod: days * 24 * 60 * 60 * 1000 },
        { upsert: true, new: true }
      );
      await interaction.reply(`Verification period updated to ${days} days.`);
    }
  },
  {
    name: 'leaderboard',
    description: 'View the top 5 users with most points',
    async execute(interaction) {
      const topUsers = await User.find({ guildId: interaction.guild.id })
        .sort({ points: -1 })
        .limit(5);
      const leaderboard = topUsers.map((u, i) => `${i + 1}. <@${u.userId}> - ${u.points} pts`).join('\n');
      await interaction.reply({ content: leaderboard || 'No data yet.', allowedMentions: { parse: [] } });
    }
  }
];

// Register commands and cache
client.commands = new Collection();
commands.forEach(cmd => client.commands.set(cmd.name, cmd));

// Slash command registration
const invitesCache = new Collection();
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
    await client.application.commands.set(commands.map(c => ({
      name: c.name,
      description: c.description,
      options: c.options || []
    })));
    console.log('Slash commands registered.');
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
});

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

// Login
client.login(process.env.TOKEN);
