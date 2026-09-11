const repo = require("../database/giveawayRepository");
const { buildGiveawayEmbed, buildGiveawayComponents } = require("./giveawayView");
const { getConfig } = require("../utils/config");
const { generateGiveawayId } = require("../utils/idGenerator");
const logger = require("../utils/logger");
const scheduler = require("./giveawayScheduler");

let clientRef = null;

function registerClient(client) {
  clientRef = client;
}

async function sendLog(guildId, text) {
  const { logChannelId } = getConfig();
  if (!logChannelId || !clientRef) return;

  try {
    const channel = await clientRef.channels.fetch(logChannelId);
    if (channel?.isTextBased()) await channel.send({ content: text });
  } catch (err) {
    logger.warn(`Log kanalına yazılamadı: ${err.message}`);
  }
}

function createDraft({ guildId, channelId, creatorId, prize, winners, durationMs, requirements, bonusEntries }) {
  const id = generateGiveawayId();
  return repo.insertGiveaway({
    id,
    guildId,
    channelId,
    messageId: null,
    creatorId,
    prize,
    winners,
    durationMs,
    endTime: null,
    createdAt: Date.now(),
    startedAt: null,
    status: "draft",
    participants: [],
    requirements,
    bonusEntries,
    pausedAt: null,
    winnerIds: [],
    rerollCount: 0,
  });
}

async function startGiveaway(giveawayId) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "draft") return { ok: false, message: "Bu çekiliş zaten başlatılmış veya sonlanmış." };

  const now = Date.now();
  const endTime = now + giveaway.durationMs;

  const channel = await clientRef.channels.fetch(giveaway.channelId).catch(() => null);
  if (!channel) return { ok: false, message: "Çekilişin gönderileceği kanal bulunamadı." };

  const preview = repo.updateGiveaway(giveawayId, { status: "active", startedAt: now, endTime });
  const message = await channel.send({
    embeds: [buildGiveawayEmbed(preview)],
    components: buildGiveawayComponents(preview),
  });

  const finalRecord = repo.updateGiveaway(giveawayId, { messageId: message.id });
  scheduler.scheduleEnd(finalRecord.id, endTime);

  await sendLog(giveaway.guildId, `🟢 Çekiliş başlatıldı: **${giveaway.prize}** (\`${giveaway.id}\`)`);
  return { ok: true, giveaway: finalRecord };
}

async function refreshMessage(giveaway) {
  try {
    const channel = await clientRef.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);
    await message.edit({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
  } catch (err) {
    logger.warn(`Çekiliş mesajı güncellenemedi (${giveaway.id}): ${err.message}`);
  }
}

function weightedPick(participants, count, excludeIds = []) {
  const pool = [];
  for (const p of participants) {
    if (excludeIds.includes(p.userId)) continue;
    for (let i = 0; i < Math.max(1, p.entries); i++) pool.push(p.userId);
  }

  const winners = [];
  const seen = new Set();
  let attempts = 0;
  const maxAttempts = pool.length * 5 + 10;

  while (winners.length < count && pool.length > 0 && attempts < maxAttempts) {
    attempts++;
    const index = Math.floor(Math.random() * pool.length);
    const candidate = pool[index];
    if (!seen.has(candidate)) {
      seen.add(candidate);
      winners.push(candidate);
    }
    pool.splice(index, 1);
  }

  return winners;
}

async function endGiveaway(giveawayId, { manual = false } = {}) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "active" && giveaway.status !== "paused") {
    return { ok: false, message: "Bu çekiliş zaten sonlanmış." };
  }

  scheduler.clearTimer(giveawayId);

  const winnerIds = weightedPick(giveaway.participants, giveaway.winners);
  const updated = repo.updateGiveaway(giveawayId, { status: "ended", winnerIds, endTime: Date.now() });

  await refreshMessage(updated);

  try {
    const channel = await clientRef.channels.fetch(updated.channelId);
    if (winnerIds.length > 0) {
      await channel.send({
        content: `🎉 Tebrikler ${winnerIds.map((id) => `<@${id}>`).join(", ")}! **${updated.prize}** ödülünü kazandınız!`,
      });
    } else {
      await channel.send({ content: `😕 **${updated.prize}** çekilişi için yeterli katılımcı olmadığından kazanan seçilemedi.` });
    }
  } catch (err) {
    logger.warn(`Kazanan anonsu gönderilemedi (${giveawayId}): ${err.message}`);
  }

  await sendLog(
    giveaway.guildId,
    `🏁 Çekiliş ${manual ? "manuel olarak " : ""}sona erdi: **${giveaway.prize}** (\`${giveaway.id}\`) — Kazananlar: ${
      winnerIds.length > 0 ? winnerIds.map((id) => `<@${id}>`).join(", ") : "yok"
    }`
  );

  return { ok: true, giveaway: updated };
}

async function cancelGiveaway(giveawayId) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status === "ended" || giveaway.status === "cancelled") {
    return { ok: false, message: "Bu çekiliş zaten sonlanmış veya iptal edilmiş." };
  }

  scheduler.clearTimer(giveawayId);
  const updated = repo.updateGiveaway(giveawayId, { status: "cancelled" });

  if (updated.messageId) await refreshMessage(updated);
  await sendLog(giveaway.guildId, `🚫 Çekiliş iptal edildi: **${giveaway.prize}** (\`${giveaway.id}\`)`);

  return { ok: true, giveaway: updated };
}

async function rerollGiveaway(giveawayId, { count = null, includeOldWinners = false } = {}) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "ended") return { ok: false, message: "Yalnızca sona ermiş çekilişler için yeniden çekiliş yapılabilir." };

  const winnerCount = count || giveaway.winners;
  const excludeIds = includeOldWinners ? [] : giveaway.winnerIds;
  const newWinners = weightedPick(giveaway.participants, winnerCount, excludeIds);

  const updated = repo.updateGiveaway(giveawayId, {
    winnerIds: newWinners,
    rerollCount: giveaway.rerollCount + 1,
  });

  await refreshMessage(updated);

  try {
    const channel = await clientRef.channels.fetch(updated.channelId);
    if (newWinners.length > 0) {
      await channel.send({
        content: `🔁 Yeniden çekiliş! Yeni kazananlar: ${newWinners.map((id) => `<@${id}>`).join(", ")} — **${updated.prize}**`,
      });
    } else {
      await channel.send({ content: `😕 Yeniden çekiliş için uygun katılımcı bulunamadı.` });
    }
  } catch (err) {
    logger.warn(`Reroll anonsu gönderilemedi (${giveawayId}): ${err.message}`);
  }

  await sendLog(giveaway.guildId, `🔁 Yeniden çekiliş yapıldı: \`${giveaway.id}\``);
  return { ok: true, giveaway: updated };
}

async function pauseGiveaway(giveawayId, blockJoin = true) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "active") return { ok: false, message: "Sadece aktif çekilişler duraklatılabilir." };

  scheduler.clearTimer(giveawayId);

  const requirements = { ...giveaway.requirements, _pauseBlocksJoin: blockJoin };
  const updated = repo.updateGiveaway(giveawayId, { status: "paused", pausedAt: Date.now(), requirements });

  await refreshMessage(updated);
  await sendLog(giveaway.guildId, `⏸️ Çekiliş duraklatıldı: \`${giveaway.id}\``);
  return { ok: true, giveaway: updated };
}

async function resumeGiveaway(giveawayId) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "paused") return { ok: false, message: "Sadece duraklatılmış çekilişler devam ettirilebilir." };

  const remaining = giveaway.endTime - giveaway.pausedAt;
  const newEndTime = Date.now() + Math.max(remaining, 1000);

  const updated = repo.updateGiveaway(giveawayId, { status: "active", endTime: newEndTime, pausedAt: null });
  scheduler.scheduleEnd(giveawayId, newEndTime);

  await refreshMessage(updated);
  await sendLog(giveaway.guildId, `▶️ Çekiliş devam ettirildi: \`${giveaway.id}\``);
  return { ok: true, giveaway: updated };
}

async function extendGiveaway(giveawayId, ms) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "active" && giveaway.status !== "paused") {
    return { ok: false, message: "Sadece aktif veya duraklatılmış çekilişler uzatılabilir." };
  }

  const newEndTime = giveaway.endTime + ms;
  const updated = repo.updateGiveaway(giveawayId, { endTime: newEndTime });

  if (giveaway.status === "active") scheduler.scheduleEnd(giveawayId, newEndTime);
  await refreshMessage(updated);
  await sendLog(giveaway.guildId, `⏫ Çekiliş uzatıldı: \`${giveaway.id}\``);
  return { ok: true, giveaway: updated };
}

async function shortenGiveaway(giveawayId, ms) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.status !== "active" && giveaway.status !== "paused") {
    return { ok: false, message: "Sadece aktif veya duraklatılmış çekilişler kısaltılabilir." };
  }

  const newEndTime = Math.max(giveaway.endTime - ms, Date.now() + 2000);
  const updated = repo.updateGiveaway(giveawayId, { endTime: newEndTime });

  if (giveaway.status === "active") scheduler.scheduleEnd(giveawayId, newEndTime);
  await refreshMessage(updated);
  await sendLog(giveaway.guildId, `⏬ Çekiliş kısaltıldı: \`${giveaway.id}\``);
  return { ok: true, giveaway: updated };
}

module.exports = {
  registerClient,
  createDraft,
  startGiveaway,
  endGiveaway,
  cancelGiveaway,
  rerollGiveaway,
  pauseGiveaway,
  resumeGiveaway,
  extendGiveaway,
  shortenGiveaway,
  refreshMessage,
  weightedPick,
  sendLog,
};
