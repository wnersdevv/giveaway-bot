const { getDb } = require("./db");

function incrementMessageCount(guildId, userId, cooldownMs) {
  const db = getDb();
  const now = Date.now();
  const row = db.prepare("SELECT * FROM message_stats WHERE guildId = ? AND userId = ?").get(guildId, userId);

  if (!row) {
    db.prepare(
      "INSERT INTO message_stats (guildId, userId, messageCount, lastCountedAt) VALUES (?, ?, 1, ?)"
    ).run(guildId, userId, now);
    return;
  }

  if (now - row.lastCountedAt < cooldownMs) return;

  db.prepare(
    "UPDATE message_stats SET messageCount = messageCount + 1, lastCountedAt = ? WHERE guildId = ? AND userId = ?"
  ).run(now, guildId, userId);
}

function getMessageCount(guildId, userId) {
  const db = getDb();
  const row = db.prepare("SELECT messageCount FROM message_stats WHERE guildId = ? AND userId = ?").get(guildId, userId);
  return row ? row.messageCount : 0;
}

function incrementInviteCount(guildId, inviterId) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM invite_stats WHERE guildId = ? AND inviterId = ?").get(guildId, inviterId);

  if (!row) {
    db.prepare("INSERT INTO invite_stats (guildId, inviterId, count) VALUES (?, ?, 1)").run(guildId, inviterId);
    return;
  }

  db.prepare("UPDATE invite_stats SET count = count + 1 WHERE guildId = ? AND inviterId = ?").run(guildId, inviterId);
}

function getInviteCount(guildId, userId) {
  const db = getDb();
  const row = db.prepare("SELECT count FROM invite_stats WHERE guildId = ? AND inviterId = ?").get(guildId, userId);
  return row ? row.count : 0;
}

module.exports = { incrementMessageCount, getMessageCount, incrementInviteCount, getInviteCount };
