// Discord Invite Tracker Bot (Upgraded)
// Required packages: discord.js, mongoose

const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');

// Use Railway variables instead of .env
// const MONGODB_URI = process.env.MONGODB_URI
// const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages
  ]
});

// MongoDB schemas
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  points: { type: Number, default: 0 },
  pendingPoints: { type: Number, default: 0 },
  invitedUsers: [{ type: String }]
});

const ConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  verificationPeriod: { type: Number, default: 7 * 24 * 60 * 60 * 1000 }, // 7 days in milliseconds
  notificationChannelId: { type: String, default: null } // Added notification channel
});

const User = mongoose.model('User', UserSchema);
const Config = mongoose.model('Config', ConfigSchema);

// Cache to store invites
const invitesCache = new Collection();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

client.once(Events.ClientReady, async () => {
  console.log(`Bot is online as ${client.user.tag}!`);
  
  // Cache all guild invites when the bot starts
  client.guilds.cache.forEach(async guild => {
    try {
      const guildInvites = await guild.invites.fetch();
      invitesCache.set(guild.id, new Collection(guildInvites.map(invite => [invite.code, invite.uses])));
    } catch (err) {
      console.error(`Error fetching invites for guild ${guild.id}:`, err);
    }
  });
  
  // Register the slash commands with Discord
  try {
    console.log('Started refreshing application (/) commands.');
    
    await client.application?.commands.set(commands.map(command => ({
      name: command.name,
      description: command.description,
      options: command.options || []
    })));
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

// Handle when bot joins a new guild
client.on(Events.GuildCreate, async guild => {
  try {
    console.log(`Joined new guild: ${guild.name}`);
    
    // Initialize invites cache for the new guild
    const guildInvites = await guild.invites.fetch();
    invitesCache.set(guild.id, new Collection(guildInvites.map(invite => [invite.code, invite.uses])));
    
    // Create default config for the guild
    await Config.findOneAndUpdate(
      { guildId: guild.id },
      { guildId: guild.id },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`Error initializing new guild ${guild.id}:`, err);
  }
});

// Listen for when a new invite is created
client.on(Events.InviteCreate, invite => {
  const guildInvites = invitesCache.get(invite.guild.id) || new Collection();
  guildInvites.set(invite.code, invite.uses);
  invitesCache.set(invite.guild.id, guildInvites);
});

// Function to get notification channel
async function getNotificationChannel(guild) {
  try {
    // Get config for this guild
    const config = await Config.findOne({ guildId: guild.id });
    
    // If there's a configured notification channel, use it
    if (config && config.notificationChannelId) {
      const channel = await guild.channels.fetch(config.notificationChannelId).catch(() => null);
      if (channel) return channel;
    }
    
    // Fallback to system channel
    return guild.systemChannel;
  } catch (err) {
    console.error(`Error getting notification channel for guild ${guild.id}:`, err);
    return guild.systemChannel; // Fallback
  }
}

// Track invite usage when a member joins
client.on(Events.GuildMemberAdd, async member => {
  try {
    // Fetch new invites
    const newInvites = await member.guild.invites.fetch();
    // Get cached invites
    const oldInvites = invitesCache.get(member.guild.id) || new Collection();
    
    // Find the invite that was used
    let usedInvite = newInvites.find(invite => {
      const oldUses = oldInvites.get(invite.code) || 0;
      return invite.uses > oldUses;
    });

    if (usedInvite) {
      // Update the cache
      invitesCache.set(member.guild.id, new Collection(newInvites.map(invite => [invite.code, invite.uses])));
      
      // Get the inviter
      const inviter = usedInvite.inviter;
      if (inviter && inviter.id !== member.id) { // Make sure inviter isn't the same as the new member
        // Update inviter's points
        let inviterData = await User.findOne({ userId: inviter.id, guildId: member.guild.id });
        
        if (!inviterData) {
          inviterData = new User({
            userId: inviter.id,
            guildId: member.guild.id,
            points: 0,
            pendingPoints: 1,
            invitedUsers: [member.id]
          });
        } else {
          inviterData.pendingPoints += 1;
          inviterData.invitedUsers.push(member.id);
        }
        
        await inviterData.save();
        
        // Send notification message to configured channel
        const channel = await getNotificationChannel(member.guild);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('New Member Invited!')
            .setDescription(`${member.user.tag} was invited by ${inviter.tag}`)
            .addFields(
              { name: 'Inviter Current Points', value: `${inviterData.points}`, inline: true },
              { name: 'Pending Points', value: `${inviterData.pendingPoints}`, inline: true }
            )
            .setTimestamp();
          
          channel.send({ embeds: [embed] })
            .catch(err => console.error(`Error sending join notification: ${err}`));
        }
        
        // Schedule verification check
        const config = await Config.findOne({ guildId: member.guild.id }) || { verificationPeriod: 7 * 24 * 60 * 60 * 1000 };
        
        setTimeout(async () => {
          try {
            // Check if member is still in the guild
            const memberStillExists = await member.guild.members.fetch(member.id).catch(() => null);
            
            if (memberStillExists) {
              // Verification passed
              await User.updateOne(
                { userId: inviter.id, guildId: member.guild.id },
                { $inc: { points: 1, pendingPoints: -1 } }
              );
              
              // Send verification success notification
              const verifyChannel = await getNotificationChannel(member.guild);
              if (verifyChannel) {
                const verifyEmbed = new EmbedBuilder()
                  .setColor('#0099FF')
                  .setTitle('Invite Verified!')
                  .setDescription(`${member.user.tag} has stayed in the server for the verification period. ${inviter.tag} earned 1 point!`)
                  .setTimestamp();
                  
                verifyChannel.send({ embeds: [verifyEmbed] })
                  .catch(err => console.error(`Error sending verification notification: ${err}`));
              }
              
              console.log(`${member.user.tag} verified, ${inviter.tag} got +1 point`);
            }
          } catch (error) {
            console.error('Error during verification check:', error);
          }
        }, config.verificationPeriod);
      }
    }
  } catch (error) {
    console.error('Error handling member join:', error);
  }
});

// Track when a member leaves
client.on(Events.GuildMemberRemove, async member => {
  try {
    // Find if this user was invited by someone
    const inviterData = await User.findOne({ 
      guildId: member.guild.id,
      invitedUsers: member.id
    });
    
    if (inviterData) {
      // Remove the user from invitedUsers array
      inviterData.invitedUsers = inviterData.invitedUsers.filter(id => id !== member.id);
      
      // Subtract point if they had earned it (not pending)
      if (inviterData.pendingPoints > 0) {
        inviterData.pendingPoints -= 1;
      } else {
        inviterData.points -= 1;
      }
      
      await inviterData.save();
      
      // Send notification to configured channel
      const channel = await getNotificationChannel(member.guild);
      if (channel) {
        const inviter = await client.users.fetch(inviterData.userId).catch(() => null);
        const inviterName = inviter ? inviter.tag : 'Unknown User';
        
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Invited Member Left')
          .setDescription(`${member.user.tag} who was invited by ${inviterName} has left the server`)
          .addFields(
            { name: 'Inviter Updated Points', value: `${inviterData.points}`, inline: true },
            { name: 'Pending Points', value: `${inviterData.pendingPoints}`, inline: true }
          )
          .setTimestamp();
        
        channel.send({ embeds: [embed] })
          .catch(err => console.error(`Error sending leave notification: ${err}`));
      }
    }
  } catch (error) {
    console.error('Error handling member leave:', error);
  }
});

// Command handler for slash commands
client.commands = new Collection();

// Define slash commands
const commands = [
  {
    name: 'points',
    description: 'Check your invite points',
    execute: async (interaction) => {
      try {
        const userData = await User.findOne({
          userId: interaction.user.id,
          guildId: interaction.guild.id
        }) || { points: 0, pendingPoints: 0, invitedUsers: [] };
        
        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('Your Invite Points')
          .addFields(
            { name: 'Current Points', value: `${userData.points}`, inline: true },
            { name: 'Pending Points', value: `${userData.pendingPoints}`, inline: true },
            { name: 'Total Invited Users', value: `${userData.invitedUsers.length}`, inline: true }
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error('Error with points command:', error);
        await interaction.reply({ 
          content: 'There was an error checking your points!', 
          ephemeral: true 
        });
      }
    }
  },
  {
    name: 'admin-points',
    description: 'Admin command to manage user points',
    options: [
      {
        name: 'action',
        type: 3, // STRING
        description: 'What action to take',
        required: true,
        choices: [
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
          { name: 'set', value: 'set' }
        ]
      },
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to modify points for',
        required: true
      },
      {
        name: 'points',
        type: 4, // INTEGER
        description: 'Number of points',
        required: true
      }
    ],
    execute: async (interaction) => {
      try {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        const action = interaction.options.getString('action');
        const targetUser = interaction.options.getUser('user');
        const points = interaction.options.getInteger('points');
        
        let userData = await User.findOne({
          userId: targetUser.id,
          guildId: interaction.guild.id
        });
        
        if (!userData) {
          userData = new User({
            userId: targetUser.id,
            guildId: interaction.guild.id,
            points: 0,
            pendingPoints: 0,
            invitedUsers: []
          });
        }
        
        switch (action) {
          case 'add':
            userData.points += points;
            break;
          case 'remove':
            userData.points -= points;
            break;
          case 'set':
            userData.points = points;
            break;
        }
        
        await userData.save();
        
        await interaction.reply({ 
          content: `Updated ${targetUser.tag}'s points to ${userData.points}`, 
          ephemeral: true 
        });
      } catch (error) {
        console.error('Error with admin-points command:', error);
        await interaction.reply({ 
          content: 'There was an error modifying points!', 
          ephemeral: true 
        });
      }
    }
  },
  {
    name: 'config',
    description: 'Configure server settings',
    options: [
      {
        name: 'verification-days',
        type: 4, // INTEGER
        description: 'Days until invited user is verified',
        required: false,
        min_value: 1,
        max_value: 30
      },
      {
        name: 'notification-channel',
        type: 7, // CHANNEL
        description: 'Channel to send notifications to',
        required: false,
        channel_types: [0] // Text channels only
      }
    ],
    execute: async (interaction) => {
      try {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        const days = interaction.options.getInteger('verification-days');
        const channel = interaction.options.getChannel('notification-channel');
        
        // Get current config
        let config = await Config.findOne({ guildId: interaction.guild.id });
        
        if (!config) {
          config = new Config({ guildId: interaction.guild.id });
        }
        
        // Update values if provided
        if (days) {
          config.verificationPeriod = days * 24 * 60 * 60 * 1000;
        }
        
        if (channel) {
          config.notificationChannelId = channel.id;
        }
        
        await config.save();
        
        // Build response message
        let response = 'Configuration updated:\n';
        
        if (days) {
          response += `- Verification period set to ${days} days\n`;
        }
        
        if (channel) {
          response += `- Notification channel set to ${channel.toString()}\n`;
        }
        
        await interaction.reply({ 
          content: response, 
          ephemeral: true 
        });
      } catch (error) {
        console.error('Error with config command:', error);
        await interaction.reply({ 
          content: 'There was an error updating configuration!', 
          ephemeral: true 
        });
      }
    }
  },
  {
    name: 'leaderboard',
    description: 'Display the top inviters in the server',
    options: [
      {
        name: 'limit',
        type: 4, // INTEGER
        description: 'Number of users to show (default: 10)',
        required: false,
        min_value: 1,
        max_value: 25
      }
    ],
    execute: async (interaction) => {
      try {
        const limit = interaction.options.getInteger('limit') || 10;
        
        // Find top users by points in this guild
        const topUsers = await User.find({ guildId: interaction.guild.id })
          .sort({ points: -1 })
          .limit(limit);
        
        if (topUsers.length === 0) {
          return interaction.reply({
            content: 'No invite data found for this server yet!',
            ephemeral: true
          });
        }
        
        // Build leaderboard embed
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🏆 Invite Leaderboard')
          .setDescription(`Top ${topUsers.length} inviters in ${interaction.guild.name}`)
          .setTimestamp();
        
        // Add each user to the leaderboard
        for (let i = 0; i < topUsers.length; i++) {
          const userData = topUsers[i];
          let user;
          
          try {
            user = await client.users.fetch(userData.userId);
          } catch (err) {
            user = { tag: 'Unknown User' };
          }
          
          embed.addFields({
            name: `#${i + 1} ${user.tag}`,
            value: `**${userData.points}** points (${userData.pendingPoints} pending)`
          });
        }
        
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error with leaderboard command:', error);
        await interaction.reply({ 
          content: 'There was an error generating the leaderboard!', 
          ephemeral: true 
        });
      }
    }
  }
];

// Register slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  const command = commands.find(cmd => cmd.name === interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: 'There was an error executing this command!', 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: 'There was an error executing this command!', 
        ephemeral: true 
      });
    }
  }
});

// Login to Discord (using Railway environment variable)
client.login(process.env.DISCORD_BOT_TOKEN);
