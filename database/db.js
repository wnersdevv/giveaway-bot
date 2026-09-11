const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { getConfig } = require("../utils/config");

let instance = null;

function getDb() {
  if (instance) return instance;

  const { database } = getConfig();
  const dbPath = path.join(__dirname, "..", database.path);
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  instance = new Database(dbPath);
  instance.pragma("journal_mode = WAL");

  instance.exec(`
    CREATE TABLE IF NOT EXISTS giveaways (
      id TEXT PRIMARY KEY,
      guildId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      messageId TEXT,
      creatorId TEXT NOT NULL,
      prize TEXT NOT NULL,
      winners INTEGER NOT NULL,
      durationMs INTEGER NOT NULL,
      endTime INTEGER,
      createdAt INTEGER NOT NULL,
      startedAt INTEGER,
      status TEXT NOT NULL,
      participants TEXT NOT NULL DEFAULT '[]',
      requirements TEXT NOT NULL DEFAULT '{}',
      bonusEntries TEXT NOT NULL DEFAULT '{}',
      pausedAt INTEGER,
      winnerIds TEXT NOT NULL DEFAULT '[]',
      rerollCount INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_giveaways_guild_status ON giveaways (guildId, status);

    CREATE TABLE IF NOT EXISTS message_stats (
      guildId TEXT NOT NULL,
      userId TEXT NOT NULL,
      messageCount INTEGER NOT NULL DEFAULT 0,
      lastCountedAt INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (guildId, userId)
    );

    CREATE TABLE IF NOT EXISTS invite_stats (
      guildId TEXT NOT NULL,
      inviterId TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (guildId, inviterId)
    );
  `);

  return instance;
}

module.exports = { getDb };
