const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
});

// =-==-==-==-= Create Methods =-==-==-==-==-=

// Stores an authenticated user
// * polity aka state
async function storeStravaUser(discordId, athlete) {
    const query = `
        INSERT INTO public.strava_users(
	    strava_id, discord_id, username, firstname, lastname, bio, \
        city, polity, country, sex, premium, created_at, updated_at, weight, avatar)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (discord_id) 
        DO UPDATE SET city = $7, polity = $8, country = $9, premium = $11, \
        updated_at = $13, "weight" = $14, avatar = $15;
    `;
    await pool.query(query, [
        athlete.id, discordId, athlete.username, athlete.firstname,
        athlete.lastname, athlete.bio, athlete.city, athlete.state, athlete.country,
        athlete.sex, athlete.premium, athlete.created_at, athlete.updated_at,
        athlete.weight, athlete.profile
    ]);

}

// Stores oauth data for a strava_user
async function storeOauth(provider, oauth) {
    const query = `
        INSERT INTO oauth_tokens (user_id, provider, token_type, access_token, refresh_token, expires_in, expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (user_id) 
        DO UPDATE SET provider = $2, access_token = $4, refresh_token = $5, expires_in = $6, \
        expires_at = $7;
    `;
    await pool.query(query, [
        oauth.id, provider, oauth.token_type, oauth.access_token, oauth.refresh_token, oauth.expires_in, oauth.expires_at
    ]);
}

// Stores an authenticated strava_users preferences
async function storePreferences(stravaId, anonymous) {
    const query = `
        INSERT INTO runstats_preferences (strava_id, "anonymous")
        VALUES ($1, $2)
        ON CONFLICT (strava_id) 
        DO UPDATE SET "anonymous" = $2;
    `;
    await pool.query(query, [stravaId, anonymous]);
}

async function saveActivity(activity) {
    const query = `
        INSERT INTO activities (id, strava_id, name, type, distance, moving_time, elapsed_time, total_elevation_gain, 
            start_date, average_speed, max_speed,average_watts, max_watts, calories, device_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            distance = EXCLUDED.distance,
            moving_time = EXCLUDED.moving_time,
            elapsed_time = EXCLUDED.elapsed_time,
            total_elevation_gain = EXCLUDED.total_elevation_gain,
            start_date = EXCLUDED.start_date,
            average_speed = EXCLUDED.average_speed,
            max_speed = EXCLUDED.max_speed,
            average_watts = EXCLUDED.average_watts,
            max_watts = EXCLUDED.max_watts,
            calories = EXCLUDED.calories,
            device_name = EXCLUDED.device_name;
    `;

    const values = [
        activity.id, activity.athlete.id, activity.name, activity.type, activity.distance,
        activity.moving_time, activity.elapsed_time, activity.total_elevation_gain,
        activity.start_date, activity.average_speed, activity.max_speed,
        activity.average_watts, activity.max_watts, activity.calories, activity.device_name
    ];

    await pool.query(query, values);
}

// =-==-==-==-= Read Methods =-==-==-==-==-=

// Retrieve a strava_user from discordID
async function getStravaUser(discordId) {
    const query = `SELECT * FROM strava_users WHERE discord_id = $1;`;
    const result = await pool.query(query, [discordId]);
    return result.rows[0];
}


// Retrieve user_preferences using a discordID
async function getPreferences(discordId) {
    const query = `SELECT * FROM user_preferences WHERE discord_id = $1;`;
    const result = await pool.query(query, [discordId]);
    return result.rows[0];
}

async function getAccessTokenByProviderID(stravaID) {
    const query = `SELECT access_token FROM oauth_tokens WHERE user_id = $1;`;
    const result = await pool.query(query, [stravaID]);

    if (result.rows.length === 0) {
        throw new Error("Strava user not found in the database");
    }

    const { access_token } = result.rows[0];
    return access_token;
}

// =-==-==-==-= Update Methods =-==-==-==-==-=
// saveActivity => UPSERT

// =-==-==-==-= Delete Methods =-==-==-==-==-=

// Deletes an activity for a strava_user
async function deleteActivity(activity_id, owner_id) {
    const query = `DELETE FROM public.activities WHERE id = $1 AND strava_id = $2;`;
    await pool.query(query, [activity_id, owner_id]);
}

async function deleteAllActivitiesByProviderID(owner_id) {
    const query = `DELETE FROM public.activities strava_id = $1;`;
    await pool.query(query, [owner_id]);
}

module.exports = {
    storeStravaUser,
    storeOauth,
    getStravaUser,
    storePreferences,
    getPreferences,
    saveActivity,
    deleteActivity,
    getAccessTokenByProviderID,
    pool
};
