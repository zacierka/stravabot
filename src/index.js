const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { handleModalCommand, handleChatCommand, handleButtonCommand } = require('./handlers/handleSlashCommand');
const { storeStravaUser, storeOauth, storePreferences } = require('./lib/database');
const { createJWT, authenticateToken } = require('./lib/tokens');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const commandsFolder = fs.readdirSync("./src/commands");

// Log in to Discord with your client's token
(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleCommands(commandsFolder, "./src/commands");
    client.login(process.env.BOT_TOKEN);
})();

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isModalSubmit) {
        handleModalCommand(client, interaction);
    }

    if (interaction.isChatInputCommand()) {
        handleChatCommand(client, interaction);
    }

    if (interaction.isButton()) {
        handleButtonCommand(client, interaction);
    }
});

app.get('/callback', async (req, res) => {
    const { code, discordId } = req.query;
    var response, athlete, oauth;
    if (!code || !discordId) {
        return res.status(400).send('Authorization failed.');
    }
    try {
        // Exchange authorization code for an access token
        if (process.env.production === "production") {
            response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
                client_id: process.env.STRAVA_CLIENTID,
                client_secret: process.env.STRAVA_CLIENTSECRET,
                code: code,
                grant_type: 'authorization_code'
            });

            athlete = response.data.athlete;
            oauth = {
                id: athlete.id,
                token_type: response.data.token_type,
                expires_at: response.data.expires_at,
                expires_in: response.data.expires_in,
                refresh_token: response.data.refresh_token,
                access_token: response.data.access_token
            }

        } else if (process.env.production === "development") {
            const data = require('./test/callback_data');
            athlete = data.athlete;
            oauth = {
                id: athlete.id,
                token_type: data.token_type,
                expires_at: data.expires_at,
                expires_in: data.expires_in,
                refresh_token: data.refresh_token,
                access_token: data.access_token
            }
        }
        console.log(`User ${athlete.id} (Discord ID: ${discordId}) authenticated!`);
        await storeStravaUser(discordId, athlete).then(() => storeOauth('strava', oauth));

        const user = await client.users.fetch(discordId);
        if (user) {
            // figure out way to instead update existing link msg. 
            const token = await createJWT({
                discord_name: user.displayName,
                strava_name: `${athlete.firstname} ${athlete.lastname}`,
                id: athlete.id
            });
            res.cookie('token', token, { httpOnly: true, secure: false }); // Set `secure: true` if using HTTPS
            res.redirect('/success');
        } else {
            res.redirect('/failure');
        }
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Authentication failed.');
    }
});

app.get('/success', authenticateToken, (req, res) => {
    res.render('success', { user: req.user });
});

app.post('/submit-preferences', authenticateToken, (req, res) => {
    const anonymousChoice = req.body.anonymous === "Yes";
    storePreferences(req.user.id, anonymousChoice);
    res.send(`Your preferences have been saved. You can close this tab.`);
});

app.get('/failure', (req, res) => {
    res.send('Authentication failed! Discord ID invalid. Try again. You may close this window');
});

// {
//     "aspect_type": "update",
//     "event_time": 1516126040,
//     "object_id": 1360128428,
//     "object_type": "activity",
//     "owner_id": 134815,
//     "subscription_id": 120475,
//     "updates": {
//         "title": "Messy"
//     }
// }
app.post('/strava/event', (req, res) => {
    try {
        const { aspect_type, object_id, object_type, owner_id } = req.body;
        // Validate required fields
        if (!object_type || !object_id || !owner_id) {
            console.log("no data present");
        }

        switch (object_type) {
            case "create":
                console.log(`Received a ${object_type} event for ${owner_id}`);
                break;
            case "create":
                console.log(`Received a ${object_type} event for ${owner_id}`);
                break;
            case "update":
                console.log(`Received a ${object_type} event for ${owner_id}`);
                break;
            case "delete":
                console.log(`Received a ${object_type} event for ${owner_id}`);
                break;
            default:
                console.log(`Received a malformed event`);
                break;
        }

    } catch (error) {
        console.log(error);

    }
    res.status(200).send('EVENT RECEIVED');
    // parse event to store in db.
    // check if owner id exists in db, if not ask user to reauthenticate
    // if aspect type create then storeActivity
    // if aspect type update then storeActivity (updates)
    // if aspect type delete then deleteActivity(object_id, owner_id)

    // handle DEAUTHORIZE requests to delete all the user data.
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});