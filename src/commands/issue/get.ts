import { ChatInputCommandInteraction } from 'discord.js';
import { buildIssueEmbed, buildErrorEmbed } from '../../components/embeds';
import type { NativeAddon } from '../../types/native';

const native: NativeAddon = require('../../../build/Release/zako_itit.node');

export async function handleIssueGet(interaction: ChatInputCommandInteraction): Promise<void> {
  const id = interaction.options.getInteger('id', true);

  if (id <= 0) {
    const embed = buildErrorEmbed('Invalid ID', 'Issue ID must be a positive number.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const issue = native.getIssue(id);

  if (!issue) {
    const embed = buildErrorEmbed('Issue Not Found', `No issue found with ID #${id}`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const embed = buildIssueEmbed(issue);
  await interaction.reply({ embeds: [embed] });
}
