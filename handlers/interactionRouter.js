const repo = require("../database/giveawayRepository");
const participationLogic = require("./participationLogic");
const { buildGiveawayEmbed } = require("./giveawayView");
const { buildParticipantsPayload } = require("./participantsView");
const { successEmbed, errorEmbed } = require("../utils/embeds");
const { hasAdminPermission } = require("../utils/permissions");

async function handleButton(interaction) {
  const [namespace, action, ...rest] = interaction.customId.split(":");
  if (namespace !== "giveaway") return;

  if (action === "join") {
    const [giveawayId] = rest;
    const result = await participationLogic.joinGiveaway(interaction.member, giveawayId);
    if (!result.ok) {
      return interaction.reply({ embeds: [errorEmbed("Katılamadın", result.message)], ephemeral: true });
    }
    return interaction.reply({
      embeds: [successEmbed("Katıldın", `Çekilişe katıldın. Toplam giriş hakkın: **${result.entries}**`)],
      ephemeral: true,
    });
  }

  if (action === "participants") {
    const [giveawayId, pageRaw] = rest;
    const giveaway = repo.getGiveawayById(giveawayId);
    if (!giveaway) return interaction.reply({ embeds: [errorEmbed("Bulunamadı", "Çekiliş bulunamadı.")], ephemeral: true });

    const isAdmin = hasAdminPermission(interaction);
    const payload = buildParticipantsPayload(giveaway, parseInt(pageRaw, 10) || 0, isAdmin);
    return interaction.reply({ ...payload, ephemeral: true });
  }

  if (action === "info") {
    const [giveawayId] = rest;
    const giveaway = repo.getGiveawayById(giveawayId);
    if (!giveaway) return interaction.reply({ embeds: [errorEmbed("Bulunamadı", "Çekiliş bulunamadı.")], ephemeral: true });
    return interaction.reply({ embeds: [buildGiveawayEmbed(giveaway)], ephemeral: true });
  }

  if (action === "resetconfirm") {
    const [guildId] = rest;
    if (!hasAdminPermission(interaction) || interaction.guildId !== guildId) {
      return interaction.reply({ embeds: [errorEmbed("İşlem başarısız", "Bu işlemi gerçekleştirmek için yeterli yetkin yok.")], ephemeral: true });
    }
    const removed = repo.clearGuildData(guildId, { keepActive: true });
    return interaction.update({
      embeds: [successEmbed("Sıfırlandı", `${removed} çekiliş kaydı silindi. Aktif çekilişler korundu.`)],
      components: [],
    });
  }

  if (action === "resetcancel") {
    return interaction.update({ embeds: [successEmbed("Vazgeçildi", "Sıfırlama işlemi iptal edildi.")], components: [] });
  }
}

module.exports = { handleButton };
