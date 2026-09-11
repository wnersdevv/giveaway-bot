const inviteTracker = require("../handlers/inviteTracker");

module.exports = {
  name: "inviteCreate",
  execute(invite) {
    inviteTracker.updateInviteInCache(invite);
  },
};
