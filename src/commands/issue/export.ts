import { ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { buildSuccessEmbed } from '../../components/embeds';
import type { NativeAddon } from '../../types/native';

const native: NativeAddon = require('../../../build/Release/zako_itit.node');

export async function handleIssueExport(interaction: ChatInputCommandInteraction): Promise<void> {
  const tag = interaction.options.getInteger('tag');

  const issues = native.listIssues(tag, null);
  const jsonContent = JSON.stringify(issues, null, 2);

  if (jsonContent.length < 2000) {
    const embed = buildSuccessEmbed('Issues Export', `\`\`\`json\n${jsonContent}\n\`\`\``);
    await interaction.reply({ embeds: [embed] });
  } else {
    const buffer = Buffer.from(jsonContent, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: 'issues.json' });

    const embed = buildSuccessEmbed('Issues Export', 'Issue list exported to JSON file (attached).');
    await interaction.reply({ embeds: [embed], files: [attachment] });
  }
}
