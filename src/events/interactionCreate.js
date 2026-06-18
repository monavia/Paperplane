const { Events } = require("discord.js");
const Logger = require("../core/utils/Logger");
const ErrorEmbed = require("../ui/embeds/ErrorEmbed");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.slashCommands?.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        Logger.error(`Slash error (/${interaction.commandName}):`, err.message);
        const reply = { embeds: [ErrorEmbed.build("An error occurred.")], ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
        else await interaction.reply(reply);
      }
      return;
    }

    if (interaction.isMessageComponent()) {
      const handler = interaction.client.componentHandlers?.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction);
        } catch (err) {
          Logger.error(`Component error (${interaction.customId}):`, err.message);
        }
      }
    }
  },
};

//======================
// Created by monavia
// Don't change if you don't know
//======================
