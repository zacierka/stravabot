const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
    const functions = fs.readdirSync(path.join(__dirname, "../../functions")).filter(file => file.endsWith(".js"));
    const commandsFolder = fs.readdirSync(path.join(__dirname, "../../commands"));
    const eventFiles = fs.readdirSync(path.join(__dirname, "../../events")).filter(file => file.endsWith(".js"));

    for (const file of functions) {
        require(`../../functions/${file}`)(client);
    }

    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandsFolder, "./src/commands");

    await client.login(process.env.BOT_TOKEN);
}