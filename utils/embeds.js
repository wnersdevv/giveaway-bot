const { EmbedBuilder } = require("discord.js");
const { getConfig } = require("./config");

function baseEmbed(color) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

function successEmbed(title, description) {
  const { colors } = getConfig();
  return baseEmbed(colors.success).setTitle(`✅ ${title}`).setDescription(description);
}

function errorEmbed(title, description) {
  const { colors } = getConfig();
  return baseEmbed(colors.error).setTitle(`❌ ${title}`).setDescription(description);
}

function infoEmbed(title, description) {
  const { colors } = getConfig();
  return baseEmbed(colors.info).setTitle(title).setDescription(description);
}

function warningEmbed(title, description) {
  const { colors } = getConfig();
  return baseEmbed(colors.warning).setTitle(`⚠️ ${title}`).setDescription(description);
}

module.exports = { successEmbed, errorEmbed, infoEmbed, warningEmbed };
