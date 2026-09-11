const { getConfig } = require("../utils/config");
const statsRepository = require("../database/statsRepository");

module.exports = {
  name: "messageCreate",
  execute(message) {
    if (message.author.bot || !message.guild) return;

    const { bonusEntries } = getConfig();
    if (!bonusEntries.messageBonus?.enabled) return;

    const cooldownMs = (bonusEntries.messageBonus.cooldownSeconds || 30) * 1000;
    statsRepository.incrementMessageCount(message.guild.id, message.author.id, cooldownMs);
  },
};
