import {
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} from 'discord.js';
import { MAX_NAME_LEN, MAX_DETAIL_LEN } from '../../constants/limits.generated';

export async function handleIssueNew(interaction: ChatInputCommandInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('ISSUE_MODAL')
    .setTitle('Create New Issue');

  const nameInput = new TextInputBuilder()
    .setCustomId('issue_name')
    .setLabel('Issue Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(MAX_NAME_LEN);

  const tagInput = new TextInputBuilder()
    .setCustomId('issue_tag')
    .setLabel('Tag (0=Bug, 1=Feature, 2=Enhancement)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(1);

  const detailInput = new TextInputBuilder()
    .setCustomId('issue_detail')
    .setLabel('Issue Detail')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(MAX_DETAIL_LEN);

  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
  const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput);
  const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(detailInput);

  modal.addComponents(firstRow, secondRow, thirdRow);

  await interaction.showModal(modal);
}
