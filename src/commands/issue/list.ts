import { ChatInputCommandInteraction } from 'discord.js';
import { buildIssueListEmbed } from '../../components/embeds';
import { createPaginationButtons } from '../../components/buttons';
import { paginateIssues } from '../../utils/pagination';
import { config } from '../../config/env';
import type { NativeAddon } from '../../types/native';

const native: NativeAddon = require('../../../build/Release/zako_itit.node');

export async function handleIssueList(interaction: ChatInputCommandInteraction): Promise<void> {
  const tag = interaction.options.getInteger('tag');
  const status = interaction.options.getInteger('status');

  const issues = native.listIssues(tag, status);

  const result = paginateIssues(issues, 1, config.embedPageSize);
  const embed = buildIssueListEmbed(result, tag, status);

  const components = [];
  if (result.totalPages > 1) {
    components.push(createPaginationButtons(result.currentPage, result.hasPrevious, result.hasNext, tag, status));
  }

  await interaction.reply({ embeds: [embed], components });
}
