const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const { handleModalCommand, handleChatCommand, handleButtonCommand } = require('./handlers/handleSlashCommand');
const { storeStravaUser, storeOauth } = require('./lib/database');
require('dotenv').config();

const CLIENT_ID = process.env.STRAVA_CLIENTID;
const CLIENT_SECRET = process.env.STRAVA_CLIENTSECRET;
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const app = express();

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const commandsFolder = fs.readdirSync("./src/commands");

// Log in to Discord with your client's token
(async () => {
    for ( file of functions ) {
        require(`./functions/${file}`)(client);
    }
    client.handleCommands(commandsFolder, "./src/commands");
    client.login(process.env.BOT_TOKEN);
})();

client.on(Events.InteractionCreate, async interaction => {

    if(interaction.isModalSubmit) {
        handleModalCommand(client, interaction);
    }

	if (interaction.isChatInputCommand()) {
        handleChatCommand(client, interaction);
    }

    if(interaction.isButton()) {
        handleButtonCommand(client, interaction);
    }
});

app.get('/callback', async (req, res) => {
    const { code, discordId } = req.query;

    if (!code || !discordId) {
        return res.status(400).send('Authorization failed.');
    }

    try {
        // Exchange authorization code for an access token
        const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code'
        });

        const { athlete } = response.data;
        const oauth = { 
            token_type: response.data.token_type, 
            expires_at: response.data.expires_at, 
            expires_in: response.data.expires_in, 
            refresh_token: response.data.refresh_token, 
            access_token: response.data.access_token 
        }

        // Store user details in your database (Discord ID -> Strava ID mapping)
        console.log(`User ${athlete.id} (Discord ID: ${discordId}) authenticated!`);
        console.log(JSON.stringify(athlete, null, 2));

        await storeStravaUser(discordId, athlete).then( () => storeOauth('strava', oauth) );

		const user = await client.users.fetch(discordId);
        if (user) {
            await user.send({
                content: 'Strava account linked! Use /settings to set your privacy settings',
            });
            res.redirect('/success');
        }

        res.redirect('/failure');
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Authentication failed.');
    }
});

app.get('/success', (req, res) => {
    res.send('Authentication successful! Your Strava account is now linked. You may close this window');
});

app.get('/failure', (req, res) => {
    res.send('Authentication failed! Discord ID invalid. Try again. You may close this window');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});