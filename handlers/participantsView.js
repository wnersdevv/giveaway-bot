const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getConfig } = require("../utils/config");

function buildParticipantsPayload(giveaway, page, isAdmin) {
  const { colors, giveaway: giveawayConfig } = getConfig();
  const total = giveaway.participants.length;

  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`👥 Katılımcılar — ${giveaway.prize}`)
    .setFooter({ text: `ID: ${giveaway.id}` });

  if (!isAdmin) {
    embed.setDescription(`Bu çekilişe **${total}** kişi katıldı.`);
    return { embeds: [embed] };
  }

  const perPage = giveawayConfig.participantsPerPage || 10;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);

  const slice = giveaway.participants.slice(safePage * perPage, safePage * perPage + perPage);
  const lines = slice.map((p, i) => `${safePage * perPage + i + 1}. <@${p.userId}> — ${p.entries} giriş`);

  embed.setDescription(
    total === 0 ? "Henüz katılımcı yok." : lines.join("\n")
  );
  embed.addFields({ name: "Toplam Katılımcı", value: String(total), inline: true });

  const components = [];
  if (totalPages > 1) {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway:participants:${giveaway.id}:${safePage - 1}`)
          .setLabel("◀ Önceki")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(safePage <= 0),
        new ButtonBuilder()
          .setCustomId(`giveaway:participants:${giveaway.id}:${safePage + 1}`)
          .setLabel("Sonraki ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(safePage >= totalPages - 1)
      )
    );
  }

  return { embeds: [embed], components };
}

module.exports = { buildParticipantsPayload };
