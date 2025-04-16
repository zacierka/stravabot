const { getAccessTokenByProviderID, saveActivity, deleteActivity } = require('../database');
const axios = require('axios');
const stravaEmbed = require('./embedResponse');

async function handleCreate(client, event) {
    const { owner_id, object_id } = event;
    console.log('Handling create event: ', object_id);
    try {


        const activity = await fetchStravaActivity(owner_id, object_id);

        console.log('Fetched Strava activity:', activity);

        await saveActivity(activity);

        console.log(`Saved Activity ${activity.id} for ${activity.athlete.id}`);

        const channel = client.channels.cache.get(process.env.STRAVA_CHANNEL_ID);
        if (!channel) {
            console.error(`Channel not found. Cannot send event for activity ${activity.id}`);
            return;
        }

        channel.send({ embeds: [stravaEmbed(activity)] })
            .then(() => console.log(`Sent Discord Embed channel:${channel.id} activity:${activity.id}`))
            .catch(console.error);

    } catch (error) {
        console.error('Error in handleCreate:', error.message);
        if (error.response) {
            console.error('Strava API Error:', error.response.data);
        }
    }
}

async function handleUpdate(event) {
    const { owner_id, object_id } = event;
    console.log('Handling create event: ', object_id);

    const activity = fetchStravaActivity(owner_id, object_id);

    console.log('Fetched Strava activity:', activity);

    await saveActivity(activity);

    console.log(`Updated Activity ${activity.id} for ${activity.athlete.id}`);
    // saveActivity
}

async function handleDelete(client, event) {
    const { owner_id, object_id } = event;

    console.log('Handling delete event:', event);
    
    await deleteActivity(object_id, owner_id);

    console.log(`Deleted Activity ${object_id} for ${owner_id}`);
}

async function fetchStravaActivity(owner_id, object_id) {
    const accessToken = await getAccessTokenByProviderID(owner_id);

    if (!accessToken) {
        console.warn(`No access token found for owner_id: ${owner_id}`);
        return;
    }

    const activityResponse = await axios.get(
        `https://www.strava.com/api/v3/activities/${object_id}?include_all_efforts=false`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return activityResponse.data;
}

module.exports = {
    handleCreate,
    handleUpdate,
    handleDelete
};