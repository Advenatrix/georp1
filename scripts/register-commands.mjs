// scripts/register-commands.mjs
import { REST, Routes } from "discord.js";
import { readdirSync }     from "fs";
import path               from "path";
import "dotenv/config";

const commandsPath = path.resolve("./commands");
const commandFiles = readdirSync(commandsPath)
  .filter(f => f.endsWith(".js") || f.endsWith(".mjs"));

const commands = [];

for (const file of commandFiles) {
  const fullPath = path.join(commandsPath, file);
  const module = await import(fullPath);
  // support both `export const data = ...` and `export default { data: ... }`
  const data =
    module.data ??
    (module.default && module.default.data);

  if (!data) {
    console.warn(`⚠️  ${file} has no “data” export — skipping.`);
    continue;
  }

  commands.push(data.toJSON());
}

if (commands.length === 0) {
  console.error("❌ No commands found to register. Aborting.");
  process.exit(1);
}

// register globally
const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

try {
  console.log(`🔄 Registering ${commands.length} global commands…`);
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_APP_ID),
    { body: commands }
  );
  console.log("✅ Successfully registered global commands!");
} catch (err) {
  console.error(err);
  process.exit(1);
}
