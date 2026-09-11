const inviteTracker = require("../handlers/inviteTracker");

module.exports = {
  name: "inviteDelete",
  execute(invite) {
    inviteTracker.removeInviteFromCache(invite);
  },
};
