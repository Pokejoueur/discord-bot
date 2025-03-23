function setupAuditLogger(client, logChannelId) {
  client.on('guildAuditLogEntryCreate', async (entry, guild) => {
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const { action, executor, target, reason } = entry;

    let logMessage = `🔔 **Audit Log Event**\n`;
    logMessage += `**Action:** ${action}\n`;
    logMessage += `**By:** ${executor.tag}\n`;
    if (target) logMessage += `**Target:** ${target.tag || target.id}\n`;
    if (reason) logMessage += `**Reason:** ${reason}\n`;

    logChannel.send(logMessage);
  });
}

module.exports = { setupAuditLogger };
