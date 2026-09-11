const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getConfig } = require("../utils/config");

function describeRequirements(req) {
  const lines = [];

  if (req.minAccountAgeDays > 0) lines.push(`• Hesap yaşı: en az ${req.minAccountAgeDays} gün`);
  if (req.minMembershipDays > 0) lines.push(`• Sunucuda kalma: en az ${req.minMembershipDays} gün`);
  if (Array.isArray(req.requiredRoleIds) && req.requiredRoleIds.length > 0) {
    lines.push(`• Gerekli rol: ${req.requiredRoleIds.map((id) => `<@&${id}>`).join(", ")}`);
  }
  if (Array.isArray(req.blockedRoleIds) && req.blockedRoleIds.length > 0) {
    lines.push(`• Yasaklı rol: ${req.blockedRoleIds.map((id) => `<@&${id}>`).join(", ")}`);
  }
  if (req.requiredChannelId) lines.push(`• Gerekli kanal erişimi: <#${req.requiredChannelId}>`);
  if (!req.allowCreatorJoin) lines.push("• Çekiliş sahibi katılamaz");

  return lines.length > 0 ? lines.join("\n") : "Özel bir katılım şartı yok.";
}

function statusLabel(status) {
  const labels = {
    draft: "📝 Taslak",
    active: "🟢 Aktif",
    paused: "⏸️ Duraklatıldı",
    ended: "🏁 Sona Erdi",
    cancelled: "🚫 İptal Edildi",
  };
  return labels[status] || status;
}

function buildGiveawayEmbed(giveaway) {
  const { colors } = getConfig();
  const colorMap = { active: colors.success, paused: colors.warning, ended: colors.info, cancelled: colors.error, draft: colors.info };

  const embed = new EmbedBuilder()
    .setColor(colorMap[giveaway.status] || colors.info)
    .setTitle(`🎉 ${giveaway.prize}`)
    .setDescription(describeRequirements(giveaway.requirements || {}))
    .addFields(
      { name: "Ödül", value: giveaway.prize, inline: true },
      { name: "Kazanan Sayısı", value: String(giveaway.winners), inline: true },
      { name: "Durum", value: statusLabel(giveaway.status), inline: true },
      { name: "Katılımcı Sayısı", value: String((giveaway.participants || []).length), inline: true },
      { name: "Çekiliş ID", value: `\`${giveaway.id}\``, inline: true },
      { name: "Başlatan", value: `<@${giveaway.creatorId}>`, inline: true }
    )
    .setFooter({ text: `ID: ${giveaway.id}` });

  if (giveaway.status === "active" && giveaway.endTime) {
    embed.addFields({ name: "Bitiş", value: `<t:${Math.floor(giveaway.endTime / 1000)}:R>`, inline: false });
  } else if (giveaway.status === "paused") {
    embed.addFields({ name: "Bitiş", value: "Duraklatıldı — süre dondu", inline: false });
  } else if (giveaway.status === "ended") {
    const winnerText = giveaway.winnerIds.length > 0
      ? giveaway.winnerIds.map((id) => `<@${id}>`).join(", ")
      : "Yeterli katılımcı olmadığı için kazanan seçilemedi.";
    embed.addFields({ name: "Kazananlar", value: winnerText, inline: false });
  } else if (giveaway.status === "cancelled") {
    embed.addFields({ name: "Not", value: "Bu çekiliş iptal edildi.", inline: false });
  }

  return embed;
}

function buildGiveawayComponents(giveaway) {
  if (giveaway.status !== "active" && giveaway.status !== "paused") return [];

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`giveaway:join:${giveaway.id}`)
      .setLabel("Katıl")
      .setEmoji("🎉")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`giveaway:participants:${giveaway.id}:0`)
      .setLabel("Katılımcılar")
      .setEmoji("👥")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`giveaway:info:${giveaway.id}`)
      .setLabel("Bilgi")
      .setEmoji("ℹ️")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

module.exports = { buildGiveawayEmbed, buildGiveawayComponents, describeRequirements, statusLabel };
