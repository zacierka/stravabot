const { getAccessTokenByProviderID, saveActivity } = require('../database');
const axios = require('axios');

async function handleCreate(event) {
    const { owner_id, object_id } = event;
    console.log('Handling create event: ', object_id);
    try {
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

        const activity = activityResponse.data;

        console.log('Fetched Strava activity:', activity);

        await saveActivity(activity);

        console.log(`Saved Activity ${activity.id} for ${activity.athlete.id}`);

    } catch (error) {
        console.error('Error in handleCreate:', error.message);
        if (error.response) {
            console.error('Strava API Error:', error.response.data);
        }
    }
}

function handleUpdate(event) {
    console.log('Handling update event:', event);
    // Update Run from database
}

function handleDelete(event) {
    console.log('Handling delete event:', event);
    // Delete Run from database
}

module.exports = {
    handleCreate,
    handleUpdate,
    handleDelete
};