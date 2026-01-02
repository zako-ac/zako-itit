import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import { config } from './config/env';
import { registerCommands } from './commands';
import { handlePing } from './commands/ping';
import { handleStatus } from './commands/status';
import { handleIssueNew } from './commands/issue/new';
import { handleIssueGet } from './commands/issue/get';
import { handleIssueList } from './commands/issue/list';
import { handleIssueSetStatus } from './commands/issue/setStatus';
import { handleIssueDelete } from './commands/issue/delete';
import { handleIssueExport } from './commands/issue/export';
import { handleModalSubmit } from './interactions/modals';
import { handleButtonInteraction } from './interactions/buttons';
import type { NativeAddon } from './types/native';

const native: NativeAddon = require('../build/Release/zako_itit.node');

async function main() {
  console.log('Initializing database...');
  if (!native.initDatabase(config.sqliteFile)) {
    console.error('Failed to initialize database');
    process.exit(1);
  }
  console.log('Database initialized successfully');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages
    ]
  });

  client.once('ready', async () => {
    if (!client.user || !client.application) {
      console.error('Client user or application is not available');
      process.exit(1);
    }

    console.log(`Logged in as ${client.user.tag}`);

    try {
      await registerCommands(config.discordToken, client.application.id);
    } catch (error) {
      console.error('Failed to register commands:', error);
      process.exit(1);
    }

    client.user.setActivity('Tracking issues');
    console.log('Bot is ready!');
  });

  client.on('interactionCreate', async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'ping') {
          await handlePing(interaction);
        } else if (interaction.commandName === 'status') {
          await handleStatus(interaction);
        } else if (interaction.commandName === 'issue') {
          const subcommand = interaction.options.getSubcommand();

          switch (subcommand) {
            case 'new':
              await handleIssueNew(interaction);
              break;
            case 'get':
              await handleIssueGet(interaction);
              break;
            case 'list':
              await handleIssueList(interaction);
              break;
            case 'set-status':
              await handleIssueSetStatus(interaction);
              break;
            case 'delete':
              await handleIssueDelete(interaction);
              break;
            case 'export':
              await handleIssueExport(interaction);
              break;
            default:
              console.warn(`Unknown subcommand: ${subcommand}`);
          }
        }
      }
      else if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
      }
      else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);

      const errorMessage = 'An error occurred while processing your request.';
      try {
        if (interaction.isRepliable()) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
          } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
          }
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  });

  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });

  client.on('shardDisconnect', (event, id) => {
    console.error(`Shard ${id} disconnected with code ${event.code} and reason: ${event.reason}`);
    shutdown(1);
  });

  function shutdown(exitCode: number) {
    console.log('Shutting down...');
    client.destroy();
    native.closeDatabase();
    console.log('Database connection closed');
    process.exit(exitCode);
  }

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));

  await client.login(config.discordToken);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
