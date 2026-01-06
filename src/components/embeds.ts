import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Issue, TAG_NAMES, STATUS_NAMES } from '../types/issue';
import { PaginatedResult } from '../utils/pagination';
import { DETAIL_PREVIEW_LEN } from '../constants/limits.generated';

const COLORS = {
  SUCCESS: 0x00FF00 as ColorResolvable,
  ERROR: 0xFF0000 as ColorResolvable,
  INFO: 0x0099FF as ColorResolvable,
  WARNING: 0xFFCC00 as ColorResolvable
};

export function buildIssueEmbed(issue: Issue): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`Issue #${issue.id}: ${issue.name}`)
    .setDescription(issue.detail)
    .setColor(COLORS.INFO)
    .addFields(
      { name: 'Tag', value: TAG_NAMES[issue.tag] || 'Unknown', inline: true },
      { name: 'Status', value: STATUS_NAMES[issue.status] || 'Unknown', inline: true },
      { name: 'Created by', value: `<@${issue.userId}>`, inline: true }
    )
    .setTimestamp();

  return embed;
}

export function buildIssueListEmbed(
  result: PaginatedResult<Issue>,
  tag?: number | null,
  status?: number | null
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('Issue List')
    .setColor(COLORS.INFO);

  const filterParts: string[] = [];
  if (tag !== null && tag !== undefined) {
    filterParts.push(`Tag: ${TAG_NAMES[tag]}`);
  }
  if (status !== null && status !== undefined) {
    filterParts.push(`Status: ${STATUS_NAMES[status]}`);
  }

  if (filterParts.length > 0) {
    embed.setDescription(`Filters: ${filterParts.join(', ')}`);
  }

  if (result.items.length === 0) {
    embed.addFields({ name: 'No Issues', value: 'No issues found matching the criteria.' });
  } else {
    for (const issue of result.items) {
      const fieldValue = [
        `**Detail:** ${issue.detail.length > DETAIL_PREVIEW_LEN ? issue.detail.substring(0, DETAIL_PREVIEW_LEN) + '...' : issue.detail}`,
        `**Tag:** ${TAG_NAMES[issue.tag]} | **Status:** ${STATUS_NAMES[issue.status]}`,
        `**Created by:** <@${issue.userId}>`
      ].join('\n');

      embed.addFields({
        name: `#${issue.id}: ${issue.name}`,
        value: fieldValue
      });
    }
  }

  embed.setFooter({
    text: `Page ${result.currentPage} of ${result.totalPages} | Total: ${result.totalCount} issues`
  });

  return embed;
}

export function buildSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
}

export function buildErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(COLORS.ERROR)
    .setTimestamp();
}
