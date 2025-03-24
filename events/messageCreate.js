const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Example 1: Auto-reply to "hello"
        if (message.content.toLowerCase() === "hello") {
            message.reply("👋 Hi there!");
        }

        // Example 2: Simple moderation (delete bad words)
        const bannedWords = ["badword1", "badword2"];
        if (bannedWords.some(word => message.content.toLowerCase().includes(word))) {
            await message.delete();
            message.channel.send(`${message.author}, please avoid using inappropriate language.`);
        }

        // Example 3: Economy & Level System (Placeholder for future expansion)
        // Here, you would increase user XP or manage currency.

        console.log(`[${message.guild.name}] #${message.channel.name} | ${message.author.tag}: ${message.content}`);
    }
};
