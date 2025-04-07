const axios = require('axios');

// Exchange authorization code for an access token
async function exchangeToken(code) {
    const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code'
    });

    if ( response.status == axios.HttpStatusCode.Ok ) {
        return response;
    }

    return null;
}

module.exports = { exchangeToken }