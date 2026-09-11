const inviteTracker = require("../handlers/inviteTracker");
const statsRepository = require("../database/statsRepository");
const { getConfig } = require("../utils/config");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const { bonusEntries } = getConfig();
    if (!bonusEntries.inviteBonus?.enabled) return;
    if (member.user.bot) return;

    const inviterId = await inviteTracker.resolveUsedInvite(member);
    if (inviterId && inviterId !== member.id) {
      statsRepository.incrementInviteCount(member.guild.id, inviterId);
    }
  },
};
