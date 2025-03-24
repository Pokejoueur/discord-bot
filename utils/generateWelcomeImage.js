const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

async function generateWelcomeImage(member) {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Load Background Image
    const background = await Canvas.loadImage('https://i.imgur.com/zvWTUVu.png'); // Replace with your image URL
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // User Avatar
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 25, 25, 200, 200);

    // Welcome Text
    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Welcome, ${member.user.username}!`, 250, 100);

    // Create Image
    return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });
}

module.exports = generateWelcomeImage;
