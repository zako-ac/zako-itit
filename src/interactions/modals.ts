import { ModalSubmitInteraction } from 'discord.js';
import { buildSuccessEmbed, buildErrorEmbed } from '../components/embeds';
import { IssueTag } from '../types/issue';
import type { NativeAddon } from '../types/native';

const native: NativeAddon = require('../../build/Release/zako_itit.node');

export async function handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId === 'ISSUE_MODAL') {
    const name = interaction.fields.getTextInputValue('issue_name');
    const tagStr = interaction.fields.getTextInputValue('issue_tag');
    const detail = interaction.fields.getTextInputValue('issue_detail');

    const tag = parseInt(tagStr, 10);

    if (isNaN(tag) || tag < 0 || tag > 2) {
      const embed = buildErrorEmbed(
        'Invalid Tag',
        'Tag must be 0 (Bug), 1 (Feature), or 2 (Enhancement).'
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const userId = interaction.user.id;
    const issueId = native.createIssue(name, detail, tag as IssueTag, userId);

    if (issueId === -1) {
      const embed = buildErrorEmbed('Error', 'Failed to create issue. Please try again.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const embed = buildSuccessEmbed(
      'Issue Created',
      `Successfully created issue #${issueId}: **${name}**`
    );
    await interaction.reply({ embeds: [embed] });
  }
}
