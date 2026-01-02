import {
  SlashCommandBuilder,
  REST,
  Routes,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js';
import { IssueTag, IssueStatus } from '../types/issue';

const TAG_CHOICES = [
  { name: 'Bug', value: IssueTag.Bug },
  { name: 'Feature', value: IssueTag.Feature },
  { name: 'Enhancement', value: IssueTag.Enhancement }
];

const STATUS_CHOICES = [
  { name: 'Proposed', value: IssueStatus.Proposed },
  { name: 'Approved', value: IssueStatus.Approved },
  { name: 'Rejected', value: IssueStatus.Rejected },
  { name: 'Deleted', value: IssueStatus.Deleted }
];

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is alive')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show server status and resource usage')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('issue')
    .setDescription('Issue tracking commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('new')
        .setDescription('Create a new issue')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Get an issue by ID')
        .addIntegerOption(option =>
          option
            .setName('id')
            .setDescription('Issue ID')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all issues')
        .addIntegerOption(option =>
          option
            .setName('tag')
            .setDescription('Filter by tag')
            .setRequired(false)
            .addChoices(...TAG_CHOICES)
        )
        .addIntegerOption(option =>
          option
            .setName('status')
            .setDescription('Filter by status')
            .setRequired(false)
            .addChoices(...STATUS_CHOICES)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('set-status')
        .setDescription('Update issue status (Admin only)')
        .addIntegerOption(option =>
          option
            .setName('id')
            .setDescription('Issue ID')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('status')
            .setDescription('New status')
            .setRequired(true)
            .addChoices(...STATUS_CHOICES)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete an issue (Admin only)')
        .addIntegerOption(option =>
          option
            .setName('id')
            .setDescription('Issue ID')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('export')
        .setDescription('Export issues as JSON')
        .addIntegerOption(option =>
          option
            .setName('tag')
            .setDescription('Filter by tag')
            .setRequired(false)
            .addChoices(...TAG_CHOICES)
        )
    )
    .toJSON()
];

export async function registerCommands(token: string, clientId: string): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
    throw error;
  }
}
