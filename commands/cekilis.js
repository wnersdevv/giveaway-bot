const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../utils/config");
const { parseDuration, formatDuration } = require("../utils/duration");
const { extractIds } = require("../utils/snowflake");
const { hasAdminPermission } = require("../utils/permissions");
const { successEmbed, errorEmbed, infoEmbed } = require("../utils/embeds");
const { buildGiveawayEmbed, buildGiveawayComponents, statusLabel } = require("../handlers/giveawayView");
const repo = require("../database/giveawayRepository");
const giveawayLogic = require("../handlers/giveawayLogic");
const participationLogic = require("../handlers/participationLogic");
const { buildParticipantsPayload } = require("../handlers/participantsView");

function requireAdmin(interaction) {
  if (!hasAdminPermission(interaction)) {
    return { blocked: true, reply: { embeds: [errorEmbed("İşlem başarısız", "Bu işlemi gerçekleştirmek için yeterli yetkin yok.")], ephemeral: true } };
  }
  return { blocked: false };
}

function buildRequirements(interaction, config) {
  const requiredRoles = extractIds(interaction.options.getString("gerekli_roller"));
  const blockedRoles = extractIds(interaction.options.getString("yasakli_roller"));
  const requiredChannel = interaction.options.getChannel("gerekli_kanal");
  const allowCreatorJoinOption = interaction.options.getBoolean("sahip_katilabilir");

  return {
    allowCreatorJoin: allowCreatorJoinOption ?? config.giveaway.allowCreatorJoin,
    minAccountAgeDays: interaction.options.getInteger("min_hesap_yasi") ?? config.requirementDefaults.minAccountAgeDays,
    minMembershipDays: interaction.options.getInteger("min_sunucuda_kalma") ?? config.requirementDefaults.minMembershipDays,
    requiredRoleIds: requiredRoles,
    blockedRoleIds: blockedRoles,
    requiredChannelId: requiredChannel ? requiredChannel.id : null,
  };
}

function buildBonusFlags(interaction) {
  return {
    rolesEnabled: interaction.options.getBoolean("bonus_rol") ?? false,
    messageEnabled: interaction.options.getBoolean("bonus_mesaj") ?? false,
    inviteEnabled: interaction.options.getBoolean("bonus_davet") ?? false,
    membershipEnabled: interaction.options.getBoolean("bonus_uyelik") ?? false,
  };
}

async function resolveGiveaway(interaction, id, { requireGuild = true } = {}) {
  const giveaway = repo.getGiveawayById(id);
  if (!giveaway) {
    await interaction.reply({ embeds: [errorEmbed("Bulunamadı", `\`${id}\` ID'li bir çekiliş bulunamadı.`)], ephemeral: true });
    return null;
  }
  if (requireGuild && giveaway.guildId !== interaction.guildId) {
    await interaction.reply({ embeds: [errorEmbed("Bulunamadı", "Bu çekiliş bu sunucuya ait değil.")], ephemeral: true });
    return null;
  }
  return giveaway;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cekilis")
    .setDescription("Çekiliş sistemini yönet.")
    .addSubcommand((sub) =>
      sub
        .setName("olustur")
        .setDescription("Yeni bir çekiliş taslağı oluşturur.")
        .addStringOption((o) => o.setName("odul").setDescription("Çekiliş ödülü").setRequired(true))
        .addStringOption((o) => o.setName("sure").setDescription("Süre (örn: 1h, 2 gün, 1 saat 30 dakika)").setRequired(true))
        .addIntegerOption((o) => o.setName("kazanan_sayisi").setDescription("Kazanan sayısı").setMinValue(1).setMaxValue(50))
        .addChannelOption((o) => o.setName("kanal").setDescription("Çekilişin gönderileceği kanal"))
        .addIntegerOption((o) => o.setName("min_hesap_yasi").setDescription("Minimum hesap yaşı (gün)").setMinValue(0))
        .addIntegerOption((o) => o.setName("min_sunucuda_kalma").setDescription("Minimum sunucuda kalma süresi (gün)").setMinValue(0))
        .addStringOption((o) => o.setName("gerekli_roller").setDescription("Gerekli rol(ler) (mention veya ID, boşlukla ayır)"))
        .addStringOption((o) => o.setName("yasakli_roller").setDescription("Yasaklı rol(ler) (mention veya ID, boşlukla ayır)"))
        .addChannelOption((o) => o.setName("gerekli_kanal").setDescription("Erişimi gerekli olan kanal"))
        .addBooleanOption((o) => o.setName("bonus_rol").setDescription("Rol bazlı bonus entry aktif olsun mu?"))
        .addBooleanOption((o) => o.setName("bonus_mesaj").setDescription("Mesaj bazlı bonus entry aktif olsun mu?"))
        .addBooleanOption((o) => o.setName("bonus_davet").setDescription("Davet bazlı bonus entry aktif olsun mu?"))
        .addBooleanOption((o) => o.setName("bonus_uyelik").setDescription("Üyelik süresi bonus entry aktif olsun mu?"))
        .addBooleanOption((o) => o.setName("sahip_katilabilir").setDescription("Çekiliş sahibi katılabilsin mi?"))
    )
    .addSubcommand((sub) =>
      sub.setName("baslat").setDescription("Taslak bir çekilişi başlatır.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("bitir").setDescription("Aktif bir çekilişi hemen sonlandırır.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("iptal").setDescription("Bir çekilişi iptal eder.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("yenidencek").setDescription("Sona ermiş bir çekiliş için yeniden kazanan seçer.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
        .addIntegerOption((o) => o.setName("kazanan_sayisi").setDescription("Yeni kazanan sayısı").setMinValue(1))
        .addBooleanOption((o) => o.setName("eskilerdahil").setDescription("Eski kazananlar tekrar kazanabilsin mi?"))
    )
    .addSubcommand((sub) =>
      sub.setName("kazananlar").setDescription("Bir çekilişin kazananlarını gösterir.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("bilgi").setDescription("Bir çekilişin detaylarını gösterir.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("liste").setDescription("Sunucudaki çekilişleri listeler.")
        .addStringOption((o) =>
          o.setName("durum").setDescription("Duruma göre filtrele").addChoices(
            { name: "Taslak", value: "draft" },
            { name: "Aktif", value: "active" },
            { name: "Duraklatıldı", value: "paused" },
            { name: "Sona Erdi", value: "ended" },
            { name: "İptal Edildi", value: "cancelled" }
          )
        )
    )
    .addSubcommand((sub) =>
      sub.setName("duzenle").setDescription("Bir çekilişin bilgilerini düzenler.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
        .addStringOption((o) => o.setName("odul").setDescription("Yeni ödül"))
        .addIntegerOption((o) => o.setName("kazanan_sayisi").setDescription("Yeni kazanan sayısı").setMinValue(1))
        .addStringOption((o) => o.setName("gerekli_roller").setDescription("Gerekli rol(ler) (mention/ID)"))
        .addStringOption((o) => o.setName("yasakli_roller").setDescription("Yasaklı rol(ler) (mention/ID)"))
    )
    .addSubcommand((sub) =>
      sub.setName("katil").setDescription("Bir çekilişe katılır.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("cik").setDescription("Katıldığın bir çekilişten çıkar.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("uzat").setDescription("Bir çekilişin süresini uzatır.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
        .addStringOption((o) => o.setName("sure").setDescription("Eklenecek süre (örn: 1h)").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("kisalt").setDescription("Bir çekilişin süresini kısaltır.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
        .addStringOption((o) => o.setName("sure").setDescription("Çıkarılacak süre (örn: 30m)").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("duraklat").setDescription("Aktif bir çekilişi duraklatır.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
        .addBooleanOption((o) => o.setName("katilimi_kapat").setDescription("Duraklatma sırasında katılım kapatılsın mı? (varsayılan: evet)"))
    )
    .addSubcommand((sub) =>
      sub.setName("devam").setDescription("Duraklatılmış bir çekilişi devam ettirir.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("sartlar").setDescription("Bir çekilişin katılım şartlarını gösterir.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("katilimcilar").setDescription("Bir çekilişin katılımcılarını gösterir.")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
        .addIntegerOption((o) => o.setName("sayfa").setDescription("Sayfa numarası").setMinValue(1))
    )
    .addSubcommand((sub) =>
      sub.setName("gecmis").setDescription("Sona ermiş çekilişlerin geçmişini gösterir.")
        .addUserOption((o) => o.setName("kullanici").setDescription("Belirli bir kullanıcıya göre filtrele"))
    )
    .addSubcommand((sub) =>
      sub.setName("temizle").setDescription("Belirli bir çekiliş kaydını siler (aktif olmayan).")
        .addStringOption((o) => o.setName("id").setDescription("Çekiliş ID").setRequired(true))
    )
    .addSubcommand((sub) => sub.setName("sifirla").setDescription("Sunucudaki tüm çekiliş geçmişini temizler (aktif çekilişler korunur)."))
    .addSubcommand((sub) =>
      sub.setName("kopyala").setDescription("Var olan bir çekilişi taslak olarak kopyalar.")
        .addStringOption((o) => o.setName("id").setDescription("Kopyalanacak çekiliş ID").setRequired(true))
    ),

  async execute(interaction) {
    const config = getConfig();
    const sub = interaction.options.getSubcommand();

    const adminSubcommands = ["olustur", "baslat", "bitir", "iptal", "yenidencek", "duzenle", "uzat", "kisalt", "duraklat", "devam", "temizle", "sifirla", "kopyala"];
    if (adminSubcommands.includes(sub)) {
      const check = requireAdmin(interaction);
      if (check.blocked) return interaction.reply(check.reply);
    }

    switch (sub) {
      case "olustur": {
        const durationMs = parseDuration(interaction.options.getString("sure"));
        if (!durationMs) {
          return interaction.reply({ embeds: [errorEmbed("Geçersiz Süre", "Süre formatı anlaşılamadı. Örnek: `1h`, `2 gün`, `1 saat 30 dakika`.")], ephemeral: true });
        }

        const targetChannel = interaction.options.getChannel("kanal") || interaction.channel;
        const winners = interaction.options.getInteger("kazanan_sayisi") || config.giveaway.defaultWinners;
        if (winners > config.giveaway.maxWinners) {
          return interaction.reply({ embeds: [errorEmbed("Geçersiz Kazanan Sayısı", `Kazanan sayısı en fazla ${config.giveaway.maxWinners} olabilir.`)], ephemeral: true });
        }

        const giveaway = giveawayLogic.createDraft({
          guildId: interaction.guildId,
          channelId: targetChannel.id,
          creatorId: interaction.user.id,
          prize: interaction.options.getString("odul"),
          winners,
          durationMs,
          requirements: buildRequirements(interaction, config),
          bonusEntries: buildBonusFlags(interaction),
        });

        return interaction.reply({
          embeds: [successEmbed(
            "Taslak Oluşturuldu",
            `Çekiliş taslağı oluşturuldu.\n**ID:** \`${giveaway.id}\`\n**Süre:** ${formatDuration(durationMs)}\n**Kanal:** <#${targetChannel.id}>\n\nBaşlatmak için: \`/cekilis baslat id:${giveaway.id}\``
          )],
          ephemeral: true,
        });
      }

      case "baslat": {
        const result = await giveawayLogic.startGiveaway(interaction.options.getString("id"));
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Başlatılamadı", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Başlatıldı", `Çekiliş \`${result.giveaway.id}\` başlatıldı.`)], ephemeral: true });
      }

      case "bitir": {
        const result = await giveawayLogic.endGiveaway(interaction.options.getString("id"), { manual: true });
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Sonlandırılamadı", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Sonlandırıldı", `Çekiliş \`${result.giveaway.id}\` sonlandırıldı.`)], ephemeral: true });
      }

      case "iptal": {
        const result = await giveawayLogic.cancelGiveaway(interaction.options.getString("id"));
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("İptal Edilemedi", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("İptal Edildi", `Çekiliş \`${result.giveaway.id}\` iptal edildi.`)], ephemeral: true });
      }

      case "yenidencek": {
        const result = await giveawayLogic.rerollGiveaway(interaction.options.getString("id"), {
          count: interaction.options.getInteger("kazanan_sayisi"),
          includeOldWinners: interaction.options.getBoolean("eskilerdahil") || false,
        });
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Yeniden Çekilemedi", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Yeniden Çekildi", `Yeni kazananlar belirlendi.`)], ephemeral: true });
      }

      case "kazananlar": {
        const giveaway = await resolveGiveaway(interaction, interaction.options.getString("id"));
        if (!giveaway) return;
        if (giveaway.status !== "ended") {
          return interaction.reply({ embeds: [errorEmbed("Henüz Sonlanmadı", "Bu çekiliş henüz sona ermedi.")], ephemeral: true });
        }
        const text = giveaway.winnerIds.length > 0 ? giveaway.winnerIds.map((id) => `<@${id}>`).join(", ") : "Kazanan seçilemedi.";
        return interaction.reply({ embeds: [infoEmbed(`🏆 ${giveaway.prize}`, text)] });
      }

      case "bilgi": {
        const giveaway = await resolveGiveaway(interaction, interaction.options.getString("id"));
        if (!giveaway) return;
        return interaction.reply({ embeds: [buildGiveawayEmbed(giveaway)], ephemeral: true });
      }

      case "liste": {
        const status = interaction.options.getString("durum");
        const giveaways = repo.getGiveawaysByGuild(interaction.guildId, status || null).slice(0, 20);
        if (giveaways.length === 0) {
          return interaction.reply({ embeds: [infoEmbed("Çekiliş Listesi", "Bu kritere uyan çekiliş bulunamadı.")], ephemeral: true });
        }
        const lines = giveaways.map((g) => `\`${g.id}\` — **${g.prize}** — ${statusLabel(g.status)}`);
        return interaction.reply({ embeds: [infoEmbed("Çekiliş Listesi", lines.join("\n"))], ephemeral: true });
      }

      case "duzenle": {
        const id = interaction.options.getString("id");
        const giveaway = await resolveGiveaway(interaction, id);
        if (!giveaway) return;
        if (giveaway.status === "ended" || giveaway.status === "cancelled") {
          return interaction.reply({ embeds: [errorEmbed("Düzenlenemedi", "Sona ermiş veya iptal edilmiş çekilişler düzenlenemez.")], ephemeral: true });
        }

        const fields = {};
        const newPrize = interaction.options.getString("odul");
        const newWinners = interaction.options.getInteger("kazanan_sayisi");
        const newRequired = interaction.options.getString("gerekli_roller");
        const newBlocked = interaction.options.getString("yasakli_roller");

        if (newPrize) fields.prize = newPrize;
        if (newWinners) fields.winners = newWinners;

        const requirements = { ...giveaway.requirements };
        if (newRequired !== null) requirements.requiredRoleIds = extractIds(newRequired);
        if (newBlocked !== null) requirements.blockedRoleIds = extractIds(newBlocked);
        fields.requirements = requirements;

        const updated = repo.updateGiveaway(id, fields);
        if (updated.messageId) await giveawayLogic.refreshMessage(updated);

        return interaction.reply({ embeds: [successEmbed("Güncellendi", `Çekiliş \`${id}\` güncellendi.`)], ephemeral: true });
      }

      case "katil": {
        const result = await participationLogic.joinGiveaway(interaction.member, interaction.options.getString("id"));
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Katılamadın", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Katıldın", `Çekilişe katıldın. Toplam giriş hakkın: **${result.entries}**`)], ephemeral: true });
      }

      case "cik": {
        const result = await participationLogic.leaveGiveaway(interaction.member, interaction.options.getString("id"));
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Çıkarılamadı", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Çıkıldı", "Çekilişten çıktın.")], ephemeral: true });
      }

      case "uzat": {
        const ms = parseDuration(interaction.options.getString("sure"));
        if (!ms) return interaction.reply({ embeds: [errorEmbed("Geçersiz Süre", "Süre formatı anlaşılamadı.")], ephemeral: true });
        const result = await giveawayLogic.extendGiveaway(interaction.options.getString("id"), ms);
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Uzatılamadı", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Uzatıldı", `Çekiliş ${formatDuration(ms)} uzatıldı.`)], ephemeral: true });
      }

      case "kisalt": {
        const ms = parseDuration(interaction.options.getString("sure"));
        if (!ms) return interaction.reply({ embeds: [errorEmbed("Geçersiz Süre", "Süre formatı anlaşılamadı.")], ephemeral: true });
        const result = await giveawayLogic.shortenGiveaway(interaction.options.getString("id"), ms);
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Kısaltılamadı", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Kısaltıldı", `Çekiliş ${formatDuration(ms)} kısaltıldı.`)], ephemeral: true });
      }

      case "duraklat": {
        const blockJoin = interaction.options.getBoolean("katilimi_kapat");
        const result = await giveawayLogic.pauseGiveaway(interaction.options.getString("id"), blockJoin ?? true);
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Duraklatılamadı", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Duraklatıldı", `Çekiliş \`${result.giveaway.id}\` duraklatıldı.`)], ephemeral: true });
      }

      case "devam": {
        const result = await giveawayLogic.resumeGiveaway(interaction.options.getString("id"));
        if (!result.ok) return interaction.reply({ embeds: [errorEmbed("Devam Ettirilemedi", result.message)], ephemeral: true });
        return interaction.reply({ embeds: [successEmbed("Devam Ediyor", `Çekiliş \`${result.giveaway.id}\` devam ettiriliyor.`)], ephemeral: true });
      }

      case "sartlar": {
        const giveaway = await resolveGiveaway(interaction, interaction.options.getString("id"));
        if (!giveaway) return;
        const { describeRequirements } = require("../handlers/giveawayView");
        return interaction.reply({ embeds: [infoEmbed(`📋 ${giveaway.prize} — Katılım Şartları`, describeRequirements(giveaway.requirements))], ephemeral: true });
      }

      case "katilimcilar": {
        const giveaway = await resolveGiveaway(interaction, interaction.options.getString("id"));
        if (!giveaway) return;
        const page = (interaction.options.getInteger("sayfa") || 1) - 1;
        const isAdmin = hasAdminPermission(interaction);
        const payload = buildParticipantsPayload(giveaway, page, isAdmin);
        return interaction.reply({ ...payload, ephemeral: true });
      }

      case "gecmis": {
        const targetUser = interaction.options.getUser("kullanici");
        const ended = repo.getGiveawaysByGuild(interaction.guildId, "ended");
        const filtered = targetUser
          ? ended.filter((g) => g.winnerIds.includes(targetUser.id) || g.creatorId === targetUser.id)
          : ended;

        if (filtered.length === 0) {
          return interaction.reply({ embeds: [infoEmbed("Geçmiş", "Kayıt bulunamadı.")], ephemeral: true });
        }

        const lines = filtered.slice(0, 15).map((g) => {
          const winnersText = g.winnerIds.length > 0 ? g.winnerIds.map((id) => `<@${id}>`).join(", ") : "yok";
          return `\`${g.id}\` — **${g.prize}** — Kazananlar: ${winnersText}`;
        });

        return interaction.reply({ embeds: [infoEmbed("Çekiliş Geçmişi", lines.join("\n"))], ephemeral: true });
      }

      case "temizle": {
        const id = interaction.options.getString("id");
        const giveaway = await resolveGiveaway(interaction, id);
        if (!giveaway) return;
        if (giveaway.status === "active" || giveaway.status === "paused") {
          return interaction.reply({ embeds: [errorEmbed("Temizlenemedi", "Aktif veya duraklatılmış bir çekiliş temizlenemez, önce iptal et veya bitir.")], ephemeral: true });
        }
        repo.deleteGiveaway(id);
        return interaction.reply({ embeds: [successEmbed("Temizlendi", `Çekiliş \`${id}\` kaydı silindi.`)], ephemeral: true });
      }

      case "sifirla": {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`giveaway:resetconfirm:${interaction.guildId}`).setLabel("Onayla ve Sıfırla").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("giveaway:resetcancel").setLabel("Vazgeç").setStyle(ButtonStyle.Secondary)
        );
        return interaction.reply({
          embeds: [errorEmbed("Dikkat", "Bu işlem aktif olmayan tüm çekiliş geçmişini kalıcı olarak silecek. Onaylıyor musun?")],
          components: [row],
          ephemeral: true,
        });
      }

      case "kopyala": {
        const source = await resolveGiveaway(interaction, interaction.options.getString("id"));
        if (!source) return;

        const clone = giveawayLogic.createDraft({
          guildId: source.guildId,
          channelId: source.channelId,
          creatorId: interaction.user.id,
          prize: source.prize,
          winners: source.winners,
          durationMs: source.durationMs,
          requirements: source.requirements,
          bonusEntries: source.bonusEntries,
        });

        return interaction.reply({ embeds: [successEmbed("Kopyalandı", `Yeni taslak oluşturuldu: \`${clone.id}\`\nBaşlatmak için: \`/cekilis baslat id:${clone.id}\``)], ephemeral: true });
      }

      default:
        return interaction.reply({ embeds: [errorEmbed("Bilinmeyen Komut", "Bu alt komut tanınmadı.")], ephemeral: true });
    }
  },
};
