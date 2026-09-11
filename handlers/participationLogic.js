const repo = require("../database/giveawayRepository");
const { checkEligibility, computeBonusEntries } = require("./requirementEngine");
const { refreshMessage } = require("./giveawayLogic");

async function joinGiveaway(member, giveawayId) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };
  if (giveaway.guildId !== member.guild.id) return { ok: false, message: "Bu çekiliş bu sunucuya ait değil." };
  if (giveaway.status !== "active" && giveaway.status !== "paused") {
    return { ok: false, message: "Bu çekiliş artık katılıma açık değil." };
  }

  const alreadyJoined = giveaway.participants.some((p) => p.userId === member.id);
  if (alreadyJoined) {
    return { ok: false, message: "Bu çekilişe zaten katıldın." };
  }

  const { eligible, reason } = await checkEligibility(member, giveaway);
  if (!eligible) return { ok: false, message: reason };

  const entries = computeBonusEntries(member, giveaway);
  const participants = [...giveaway.participants, { userId: member.id, entries, joinedAt: Date.now() }];
  const updated = repo.updateGiveaway(giveawayId, { participants });

  await refreshMessage(updated);
  return { ok: true, entries, giveaway: updated };
}

async function leaveGiveaway(member, giveawayId) {
  const giveaway = repo.getGiveawayById(giveawayId);
  if (!giveaway) return { ok: false, message: "Çekiliş bulunamadı." };

  const wasParticipant = giveaway.participants.some((p) => p.userId === member.id);
  if (!wasParticipant) return { ok: false, message: "Bu çekilişe katılmamışsın." };

  const participants = giveaway.participants.filter((p) => p.userId !== member.id);
  const updated = repo.updateGiveaway(giveawayId, { participants });

  if (updated.status === "active" || updated.status === "paused") await refreshMessage(updated);
  return { ok: true, giveaway: updated };
}

module.exports = { joinGiveaway, leaveGiveaway };
