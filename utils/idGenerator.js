const crypto = require("crypto");

function generateGiveawayId() {
  return crypto.randomBytes(4).toString("hex");
}

module.exports = { generateGiveawayId };
