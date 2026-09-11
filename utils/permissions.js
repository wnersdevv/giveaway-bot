const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("./config");

function hasAdminPermission(interaction) {
  const { giveaway } = getConfig();
  const flag = PermissionFlagsBits[giveaway.adminPermission] || PermissionFlagsBits.ManageGuild;
  return interaction.memberPermissions?.has(flag) || interaction.member?.permissions?.has(flag);
}

module.exports = { hasAdminPermission };
