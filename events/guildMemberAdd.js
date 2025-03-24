const { Events } = require("discord.js");
const Canvas = require("canvas");

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "welcome");
        if (!welcomeChannel) return;

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext("2d");

        // Load background image
        const background = await Canvas.loadImage("./assets/welcome-bg.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Add username text
        ctx.font = "35px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Welcome, ${member.user.username}!`, canvas.width / 2.5, canvas.height / 1.8);

        // Load and draw the user's avatar
        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg" }));
        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, 25, 200, 200);

        // Send the welcome image
        const attachment = { files: [{ attachment: canvas.toBuffer(), name: "welcome.png" }] };
        welcomeChannel.send({ content: `👋 Welcome <@${member.id}> to **${member.guild.name}**!`, files: attachment.files });
    }
};
