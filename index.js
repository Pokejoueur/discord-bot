require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Custom status
    client.user.setPresence({
        activities: [{ name: 'PokeDral v1.0', type: ActivityType.Watching }],
        status: 'online' // online, idle, dnd, invisible
    });
});

client.login(process.env.DISCORD_TOKEN);
