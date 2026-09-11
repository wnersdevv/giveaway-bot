const logger = require("../utils/logger");

const guildInviteCache = new Map();

async function cacheGuildInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    const map = new Map();
    invites.forEach((invite) => map.set(invite.code, invite.uses || 0));
    guildInviteCache.set(guild.id, map);
  } catch (err) {
    logger.warn(`Davetler cache'lenemedi (${guild.id}): ${err.message}`);
  }
}

async function cacheAllGuilds(client) {
  for (const guild of client.guilds.cache.values()) {
    await cacheGuildInvites(guild);
  }
}

function updateInviteInCache(invite) {
  const map = guildInviteCache.get(invite.guild.id) || new Map();
  map.set(invite.code, invite.uses || 0);
  guildInviteCache.set(invite.guild.id, map);
}

function removeInviteFromCache(invite) {
  const map = guildInviteCache.get(invite.guild.id);
  if (map) map.delete(invite.code);
}

async function resolveUsedInvite(member) {
  const guild = member.guild;
  const before = guildInviteCache.get(guild.id) || new Map();

  let after;
  try {
    after = await guild.invites.fetch();
  } catch (err) {
    logger.warn(`Katılım anında davetler alınamadı: ${err.message}`);
    return null;
  }

  let usedInviterId = null;

  for (const invite of after.values()) {
    const previousUses = before.get(invite.code) || 0;
    if ((invite.uses || 0) > previousUses) {
      usedInviterId = invite.inviter?.id || null;
      break;
    }
  }

  const newMap = new Map();
  after.forEach((invite) => newMap.set(invite.code, invite.uses || 0));
  guildInviteCache.set(guild.id, newMap);

  return usedInviterId;
}

module.exports = { cacheGuildInvites, cacheAllGuilds, updateInviteInCache, removeInviteFromCache, resolveUsedInvite };
