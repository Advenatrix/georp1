// index.js (or bot.js)
import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    const command = await import(`./commands/${interaction.commandName}.js`);
    await command.default.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
