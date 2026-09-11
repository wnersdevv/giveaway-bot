const { getConfig } = require("../utils/config");
const statsRepository = require("../database/statsRepository");

async function checkEligibility(member, giveaway) {
  const req = giveaway.requirements || {};

  if (member.user.bot) {
    return { eligible: false, reason: "Bot hesapları çekilişlere katılamaz." };
  }

  if (!req.allowCreatorJoin && member.id === giveaway.creatorId) {
    return { eligible: false, reason: "Çekiliş sahibi bu çekilişe katılamaz." };
  }

  if (req.minAccountAgeDays > 0) {
    const accountAgeDays = (Date.now() - member.user.createdTimestamp) / 86400000;
    if (accountAgeDays < req.minAccountAgeDays) {
      return { eligible: false, reason: `Hesabının en az ${req.minAccountAgeDays} günlük olması gerekiyor.` };
    }
  }

  if (req.minMembershipDays > 0) {
    const membershipDays = (Date.now() - member.joinedTimestamp) / 86400000;
    if (membershipDays < req.minMembershipDays) {
      return { eligible: false, reason: `Bu sunucuda en az ${req.minMembershipDays} gündür bulunman gerekiyor.` };
    }
  }

  if (Array.isArray(req.requiredRoleIds) && req.requiredRoleIds.length > 0) {
    const hasAny = req.requiredRoleIds.some((roleId) => member.roles.cache.has(roleId));
    if (!hasAny) {
      const mentions = req.requiredRoleIds.map((id) => `<@&${id}>`).join(", ");
      return { eligible: false, reason: `Katılmak için şu rollerden birine sahip olmalısın: ${mentions}` };
    }
  }

  if (Array.isArray(req.blockedRoleIds) && req.blockedRoleIds.length > 0) {
    const hasBlocked = req.blockedRoleIds.some((roleId) => member.roles.cache.has(roleId));
    if (hasBlocked) {
      return { eligible: false, reason: "Sahip olduğun bir rol nedeniyle bu çekilişe katılamazsın." };
    }
  }

  if (req.requiredChannelId) {
    try {
      const channel = await member.guild.channels.fetch(req.requiredChannelId);
      const canView = channel?.permissionsFor(member)?.has("ViewChannel");
      if (!canView) {
        return { eligible: false, reason: `Bu çekilişe katılmak için <#${req.requiredChannelId}> kanalına erişimin olmalı.` };
      }
    } catch {
      // kanal bulunamazsa bu sartı atla
    }
  }

  if (giveaway.status === "paused" && req._pauseBlocksJoin) {
    return { eligible: false, reason: "Çekiliş şu anda duraklatılmış, katılım kapalı." };
  }

  return { eligible: true, reason: null };
}

function computeBonusEntries(member, giveaway) {
  const config = getConfig();
  const bonus = giveaway.bonusEntries || {};
  let entries = 1;

  if (bonus.rolesEnabled && Array.isArray(config.bonusEntries.roles)) {
    for (const roleConfig of config.bonusEntries.roles) {
      if (member.roles.cache.has(roleConfig.roleId)) {
        entries += roleConfig.entries;
      }
    }
  }

  if (bonus.messageEnabled && config.bonusEntries.messageBonus?.enabled) {
    const count = statsRepository.getMessageCount(member.guild.id, member.id);
    if (count >= config.bonusEntries.messageBonus.messagesRequired) {
      entries += config.bonusEntries.messageBonus.entries;
    }
  }

  if (bonus.inviteEnabled && config.bonusEntries.inviteBonus?.enabled) {
    const count = statsRepository.getInviteCount(member.guild.id, member.id);
    if (count >= config.bonusEntries.inviteBonus.invitesRequired) {
      entries += config.bonusEntries.inviteBonus.entries;
    }
  }

  if (bonus.membershipEnabled && config.bonusEntries.membershipBonus?.enabled) {
    const membershipDays = (Date.now() - member.joinedTimestamp) / 86400000;
    if (membershipDays >= config.bonusEntries.membershipBonus.days) {
      entries += config.bonusEntries.membershipBonus.entries;
    }
  }

  return entries;
}

module.exports = { checkEligibility, computeBonusEntries };
