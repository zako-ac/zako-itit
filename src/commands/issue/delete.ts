import { ChatInputCommandInteraction } from 'discord.js';
import { buildSuccessEmbed, buildErrorEmbed } from '../../components/embeds';
import { isAdmin } from '../../utils/permissions';
import type { NativeAddon } from '../../types/native';

const native: NativeAddon = require('../../../build/Release/zako_itit.node');

export async function handleIssueDelete(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!isAdmin(interaction.user.id)) {
    const embed = buildErrorEmbed('Permission Denied', 'This command is only available to administrators.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const id = interaction.options.getInteger('id', true);

  if (id <= 0) {
    const embed = buildErrorEmbed('Invalid ID', 'Issue ID must be a positive number.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  console.log(`Admin ${interaction.user.id} (${interaction.user.username}) deleting issue #${id}`);
  const success = native.deleteIssue(id);

  if (!success) {
    const embed = buildErrorEmbed('Delete Failed', `Failed to delete issue #${id}. The issue may not exist.`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const embed = buildSuccessEmbed('Issue Deleted', `Successfully deleted issue #${id}`);
  await interaction.reply({ embeds: [embed] });
}
