const logger = require("../utils/logger");
const scheduler = require("../handlers/giveawayScheduler");
const inviteTracker = require("../handlers/inviteTracker");
const giveawayLogic = require("../handlers/giveawayLogic");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    logger.info(`${client.user.tag} olarak giriş yapıldı.`);
    giveawayLogic.registerClient(client);
    await inviteTracker.cacheAllGuilds(client);
    scheduler.loadActiveGiveaways();
  },
};
