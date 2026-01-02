import { ChatInputCommandInteraction, EmbedBuilder, version as discordJsVersion } from 'discord.js';
import * as os from 'os';
import * as fs from 'fs';
import { version } from '../../package.json';

export async function handleStatus(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

  const processMem = process.memoryUsage();
  const rss = (processMem.rss / 1024 / 1024).toFixed(2);
  const heapUsed = (processMem.heapUsed / 1024 / 1024).toFixed(2);

  const loadAvg = os.loadavg()[0].toFixed(2);

  const isDocker = fs.existsSync('/.dockerenv') || fs.existsSync('/run/.containerenv');

  const embed = new EmbedBuilder()
    .setTitle('System Status')
    .setColor(0x0099FF)
    .addFields(
      { name: 'Status', value: 'Online', inline: true },
      { name: 'Version', value: `v${version}`, inline: true },
      { name: 'Discord.js', value: `v${discordJsVersion}`, inline: true },
      { name: 'Environment', value: isDocker ? 'Docker Container' : 'Native', inline: true },
      { name: 'RAM Usage (Bot)', value: `RSS: ${rss} MB\nHeap: ${heapUsed} MB`, inline: true },
      { name: 'CPU Load (1m)', value: `${loadAvg}%`, inline: true },
      { name: 'Uptime', value: `${(process.uptime() / 60).toFixed(2)} minutes`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
