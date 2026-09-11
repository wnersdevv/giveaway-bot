const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { getConfig } = require("./utils/config");
const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");
const { getDb } = require("./database/db");
const logger = require("./utils/logger");

function createClient() {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Channel, Partials.Message],
  });
}

async function bootstrap() {
  const { token } = getConfig();

  if (!token) {
    logger.error("ayarlar.json içinde 'token' alanı boş. Bot başlatılamıyor.");
    process.exit(1);
  }

  getDb();

  const client = createClient();
  loadCommands(client);
  loadEvents(client);

  await client.login(token);
}

process.on("unhandledRejection", (err) => {
  logger.error(`Yakalanmamış promise hatası: ${err?.message || err}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`Yakalanmamış hata: ${err?.message || err}`);
});

bootstrap();
