const logger = require("../utils/logger");
const { errorEmbed } = require("../utils/embeds");
const interactionRouter = require("../handlers/interactionRouter");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        await interactionRouter.handleButton(interaction);
      }
    } catch (err) {
      logger.error(`Etkileşim hatası: ${err.message}`);
      const payload = { embeds: [errorEmbed("Bir Hata Oluştu", "İşlem sırasında beklenmeyen bir hata oluştu.")], ephemeral: true };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch {
        // yanıt gönderilemedi
      }
    }
  },
};
