const axios = require('axios');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const CALLBACK_URL = process.env.STRAVA_CALLBACK_URL;
const VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN;

const STRAVA_WEBHOOK_ENDPOINT = 'https://www.strava.com/api/v3/push_subscriptions';

async function getSubscriptions() {
  const response = await axios.get(STRAVA_WEBHOOK_ENDPOINT, {
    params: {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
    },
  });
  return response.data;
}

async function createSubscription() {
  const response = await axios.post(STRAVA_WEBHOOK_ENDPOINT, null, {
    params: {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      callback_url: CALLBACK_URL,
      verify_token: VERIFY_TOKEN,
    },
  });
  return response.data;
}

async function ensureStravaWebhook() {
  try {
    const subscriptions = await getSubscriptions();
    const exists = subscriptions.some(sub => sub.callback_url === CALLBACK_URL);

    if (!exists) {
      const created = await createSubscription();
      console.log('Subscription created:', created);
    } else {
      console.log('Subscription already exists.');
    }
  } catch (err) {
    console.error('Error managing Strava subscription:', err.response?.data || err.message);
  }
}

module.exports = ensureStravaWebhook;
