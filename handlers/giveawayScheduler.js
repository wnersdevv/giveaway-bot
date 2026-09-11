const logger = require("../utils/logger");
const { getConfig } = require("../utils/config");

const timers = new Map();
let sweepInterval = null;

function clearTimer(giveawayId) {
  const existing = timers.get(giveawayId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(giveawayId);
  }
}

function scheduleEnd(giveawayId, endTime) {
  clearTimer(giveawayId);
  const delay = Math.max(endTime - Date.now(), 0);

  const timer = setTimeout(async () => {
    timers.delete(giveawayId);
    try {
      const { endGiveaway } = require("./giveawayLogic");
      await endGiveaway(giveawayId);
    } catch (err) {
      logger.error(`Zamanlanmış çekiliş sonlandırma hatası (${giveawayId}): ${err.message}`);
    }
  }, delay);

  timers.set(giveawayId, timer);
}

function startSafetySweep() {
  const { scheduler } = getConfig();
  const intervalMs = (scheduler?.safetySweepSeconds || 60) * 1000;

  if (sweepInterval) clearInterval(sweepInterval);

  sweepInterval = setInterval(async () => {
    try {
      const repo = require("../database/giveawayRepository");
      const { endGiveaway } = require("./giveawayLogic");
      const active = repo.getAllActiveOrPaused();
      const now = Date.now();

      for (const giveaway of active) {
        if (giveaway.status === "active" && giveaway.endTime && giveaway.endTime <= now && !timers.has(giveaway.id)) {
          await endGiveaway(giveaway.id);
        }
      }
    } catch (err) {
      logger.error(`Güvenlik taraması hatası: ${err.message}`);
    }
  }, intervalMs);
}

function loadActiveGiveaways() {
  const repo = require("../database/giveawayRepository");
  const active = repo.getAllActiveOrPaused();
  const now = Date.now();

  for (const giveaway of active) {
    if (giveaway.status !== "active") continue;

    if (giveaway.endTime <= now) {
      require("./giveawayLogic").endGiveaway(giveaway.id).catch((err) => logger.error(err.message));
    } else {
      scheduleEnd(giveaway.id, giveaway.endTime);
    }
  }

  logger.info(`${active.length} aktif/duraklatılmış çekiliş yüklendi.`);
  startSafetySweep();
}

module.exports = { scheduleEnd, clearTimer, loadActiveGiveaways, startSafetySweep };
