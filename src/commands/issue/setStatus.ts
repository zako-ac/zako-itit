import { ChatInputCommandInteraction } from 'discord.js';
import { buildSuccessEmbed, buildErrorEmbed } from '../../components/embeds';
import { isAdmin } from '../../utils/permissions';
import { STATUS_NAMES } from '../../types/issue';
import type { NativeAddon } from '../../types/native';

const native: NativeAddon = require('../../../build/Release/zako_itit.node');

export async function handleIssueSetStatus(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!isAdmin(interaction.user.id)) {
    const embed = buildErrorEmbed('Permission Denied', 'This command is only available to administrators.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const id = interaction.options.getInteger('id', true);
  const newStatus = interaction.options.getInteger('status', true);

  if (id <= 0) {
    const embed = buildErrorEmbed('Invalid ID', 'Issue ID must be a positive number.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const success = native.updateIssueStatus(id, newStatus);

  if (!success) {
    const embed = buildErrorEmbed('Update Failed', `Failed to update issue #${id}. The issue may not exist.`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const statusName = STATUS_NAMES[newStatus] || 'Unknown';
  const embed = buildSuccessEmbed(
    'Status Updated',
    `Successfully updated issue #${id} to status: **${statusName}**`
  );
  await interaction.reply({ embeds: [embed] });
}
