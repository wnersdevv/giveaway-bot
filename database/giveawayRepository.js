const { getDb } = require("./db");

function serializeRow(row) {
  if (!row) return null;
  return {
    ...row,
    participants: JSON.parse(row.participants || "[]"),
    requirements: JSON.parse(row.requirements || "{}"),
    bonusEntries: JSON.parse(row.bonusEntries || "{}"),
    winnerIds: JSON.parse(row.winnerIds || "[]"),
  };
}

function insertGiveaway(data) {
  const db = getDb();
  db.prepare(
    `INSERT INTO giveaways
      (id, guildId, channelId, messageId, creatorId, prize, winners, durationMs, endTime, createdAt, startedAt, status, participants, requirements, bonusEntries, pausedAt, winnerIds, rerollCount)
     VALUES
      (@id, @guildId, @channelId, @messageId, @creatorId, @prize, @winners, @durationMs, @endTime, @createdAt, @startedAt, @status, @participants, @requirements, @bonusEntries, @pausedAt, @winnerIds, @rerollCount)`
  ).run({
    id: data.id,
    guildId: data.guildId,
    channelId: data.channelId,
    messageId: data.messageId || null,
    creatorId: data.creatorId,
    prize: data.prize,
    winners: data.winners,
    durationMs: data.durationMs,
    endTime: data.endTime || null,
    createdAt: data.createdAt,
    startedAt: data.startedAt || null,
    status: data.status,
    participants: JSON.stringify(data.participants || []),
    requirements: JSON.stringify(data.requirements || {}),
    bonusEntries: JSON.stringify(data.bonusEntries || {}),
    pausedAt: data.pausedAt || null,
    winnerIds: JSON.stringify(data.winnerIds || []),
    rerollCount: data.rerollCount || 0,
  });
  return getGiveawayById(data.id);
}

function getGiveawayById(id) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM giveaways WHERE id = ?").get(id);
  return serializeRow(row);
}

function getGiveawayByMessageId(messageId) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM giveaways WHERE messageId = ?").get(messageId);
  return serializeRow(row);
}

function getGiveawaysByGuild(guildId, status = null) {
  const db = getDb();
  const rows = status
    ? db.prepare("SELECT * FROM giveaways WHERE guildId = ? AND status = ? ORDER BY createdAt DESC").all(guildId, status)
    : db.prepare("SELECT * FROM giveaways WHERE guildId = ? ORDER BY createdAt DESC").all(guildId);
  return rows.map(serializeRow);
}

function getAllActiveOrPaused() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM giveaways WHERE status = 'active' OR status = 'paused'").all();
  return rows.map(serializeRow);
}

function updateGiveaway(id, fields) {
  const db = getDb();
  const current = getGiveawayById(id);
  if (!current) return null;

  const merged = { ...current, ...fields };

  db.prepare(
    `UPDATE giveaways SET
      messageId = @messageId,
      prize = @prize,
      winners = @winners,
      durationMs = @durationMs,
      endTime = @endTime,
      startedAt = @startedAt,
      status = @status,
      participants = @participants,
      requirements = @requirements,
      bonusEntries = @bonusEntries,
      pausedAt = @pausedAt,
      winnerIds = @winnerIds,
      rerollCount = @rerollCount
     WHERE id = @id`
  ).run({
    id,
    messageId: merged.messageId || null,
    prize: merged.prize,
    winners: merged.winners,
    durationMs: merged.durationMs,
    endTime: merged.endTime || null,
    startedAt: merged.startedAt || null,
    status: merged.status,
    participants: JSON.stringify(merged.participants || []),
    requirements: JSON.stringify(merged.requirements || {}),
    bonusEntries: JSON.stringify(merged.bonusEntries || {}),
    pausedAt: merged.pausedAt || null,
    winnerIds: JSON.stringify(merged.winnerIds || []),
    rerollCount: merged.rerollCount || 0,
  });

  return getGiveawayById(id);
}

function deleteGiveaway(id) {
  const db = getDb();
  db.prepare("DELETE FROM giveaways WHERE id = ?").run(id);
}

function clearGuildData(guildId, { keepActive = true } = {}) {
  const db = getDb();
  if (keepActive) {
    return db.prepare("DELETE FROM giveaways WHERE guildId = ? AND status != 'active' AND status != 'paused'").run(guildId).changes;
  }
  return db.prepare("DELETE FROM giveaways WHERE guildId = ?").run(guildId).changes;
}

module.exports = {
  insertGiveaway,
  getGiveawayById,
  getGiveawayByMessageId,
  getGiveawaysByGuild,
  getAllActiveOrPaused,
  updateGiveaway,
  deleteGiveaway,
  clearGuildData,
};
