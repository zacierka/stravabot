// Discord Imports
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const registerBot = require('./lib/bot/clientHandler');
const path = require('path');

// Express Imports
const express = require('express');
const { exchangeToken } = require('./lib/strava/stravaOAuthFlow');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require('axios'); // @TODO move axios alls to file
const { createJWT, authenticateToken } = require('./lib/tokens');
const { handleDelete, handleCreate, handleUpdate } = require('./lib/strava/stravaParser');

// Database Imports
const { storeStravaUser, storeOauth, storePreferences } = require('./lib/database');

require('dotenv').config();

// Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
registerBot(client);

// Set Middleware and view engine
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());


app.get('/callback', async (req, res) => {
    const { code, discordId } = req.query;
    if (!code || !discordId) {
        return res.status(400).send('Authorization failed.');
    }

    var response, athlete, oauth;
    try {
        if (process.env.production === "production") {
            response = await exchangeToken(code);

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

app.post('/webhook/strava', (req, res) => {
    try {
        const event = req.body;

        console.log('Strava webhook event received:', event);
      
        switch (event.aspect_type) {
          case 'create':
            handleCreate(client, event);
            break;
          case 'update':
            handleUpdate(client, event);
            break;
          case 'delete':
            handleDelete(client, event);
            break;
          default:
            console.warn('Unknown aspect_type:', event.aspect_type);
        }

    } catch (error) {
        console.log(error);

    }
    res.status(200).send('EVENT RECEIVED');

    // handle DEAUTHORIZE requests to delete all the user data.
});

app.get('/webhook/strava', (req, res) => {
    const VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN; // must match what you use when registering

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        res.status(200).json({ 'hub.challenge': challenge });
    } else {
        res.sendStatus(403);
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});