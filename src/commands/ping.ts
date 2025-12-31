import { ChatInputCommandInteraction } from 'discord.js';

export async function handlePing(interaction: ChatInputCommandInteraction): Promise<void> {
  const sentTimestamp = Date.now();
  await interaction. deferReply();
  const latency = Date.now() - sentTimestamp;

  await interaction.editReply(
    `Pong!\nWebsocket Heartbeat: ${interaction.client.ws.ping}ms\nRoundtrip Latency: ${latency}ms`
  );
}
