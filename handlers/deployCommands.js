const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const { getConfig } = require("../utils/config");
const logger = require("../utils/logger");

async function deploy() {
  const { token, clientId, guildId } = getConfig();

  if (!token || !clientId) {
    logger.error("ayarlar.json içinde token ve clientId doldurulmadan komutlar yayınlanamaz.");
    process.exit(1);
  }

  const commandsPath = path.join(__dirname, "..", "commands");
  const commands = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".js"))
    .map((f) => require(path.join(commandsPath, f)).data.toJSON());

  const rest = new REST().setToken(token);

  const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
  await rest.put(route, { body: commands });

  logger.info(`${commands.length} komut ${guildId ? "sunucuya" : "global olarak"} yayınlandı.`);
}

if (require.main === module) {
  deploy().catch((err) => {
    logger.error(err);
    process.exit(1);
  });
}

module.exports = { deploy };
