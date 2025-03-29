const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v10');

const fs = require('fs');

const clientId = process.env.clientId;
const guildId = process.env.guildId;

module.exports = (client) => {
    client.handleCommands = async (commandsFolder, path) => {
        client.commandList = [];
        for ( folder of commandsFolder) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for ( const file of commandFiles ) {
                console.log(`reading ${folder}/${file}`);
                
                const command = require(`../commands/${folder}/${file}`);
                client.commands.set(command.data.name, command);
                client.commandList.push(command.data.toJSON());
            }
        }

        const rest = new REST({
            version: '10'
        }).setToken(process.env.BOT_TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application commands');
                await rest.put(
                    Routes.applicationCommands(clientId), {
                        body: client.commandList
                    }
                );
                console.log('Successfully reloaded application commands');
            } catch (error) {
                console.error(error);
            }
        })();
    }
}