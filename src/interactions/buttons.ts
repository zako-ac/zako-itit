import { ButtonInteraction } from 'discord.js';
import { buildIssueListEmbed } from '../components/embeds';
import { createPaginationButtons } from '../components/buttons';
import { paginateIssues } from '../utils/pagination';
import { config } from '../config/env';
import type { NativeAddon } from '../types/native';

const native: NativeAddon = require('../../build/Release/zako_itit.node');

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.split(':');

  if (parts.length < 5) {
    console.warn(`Invalid button customId format: ${interaction.customId}`);
    return;
  }

  const [prefix, action, currentPageStr, tagStr, statusStr] = parts;

  if (prefix !== 'pagination') {
    return;
  }

  const currentPage = parseInt(currentPageStr, 10);
  if (isNaN(currentPage) || currentPage < 1) {
    console.warn(`Invalid page number in customId: ${currentPageStr}`);
    return;
  }

  const tag = tagStr === 'null' ? null : parseInt(tagStr, 10);
  const status = statusStr === 'null' ? null : parseInt(statusStr, 10);

  if (tag !== null && isNaN(tag)) {
    console.warn(`Invalid tag in customId: ${tagStr}`);
    return;
  }
  if (status !== null && isNaN(status)) {
    console.warn(`Invalid status in customId: ${statusStr}`);
    return;
  }

  let newPage = currentPage;
  if (action === 'next') {
    newPage = currentPage + 1;
  } else if (action === 'prev') {
    newPage = currentPage - 1;
  }

  const issues = native.listIssues(tag, status);
  const result = paginateIssues(issues, newPage, config.embedPageSize);
  const embed = buildIssueListEmbed(result, tag, status);

  const components = [];
  if (result.totalPages > 1) {
    components.push(createPaginationButtons(result.currentPage, result.hasPrevious, result.hasNext, tag, status));
  }

  await interaction.update({ embeds: [embed], components });
}
