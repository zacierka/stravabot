const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

// Function to store user authentication data
// CREATE TABLE IF NOT EXISTS strava_users (
//     strava_id TEXT PRIMARY KEY,
//     discord_id TEXT UNIQUE NOT NULL,
//     username TEXT NOT NULL,
//     firstname TEXT NOT NULL,
//     lastname TEXT,
//     bio TEXT,
//     city TEXT,
//     `state` TEXT,
//     country TEXT,
//     sex SEX,
//     premium BOOLEAN,
//     created_at TIMESTAMP,
//     updated_at TIMESTAMP,
//     `weight` REAL,
//     avatar TEXT
// );
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

// CREATE TABLE IF NOT EXISTS oauth_tokens (
//     user_id TEXT PRIMARY KEY,
//     provider TEXT,
//     token_type TEXT, 
//     access_token TEXT,
//     refresh_token TEXT, 
//     expires_in INT,
//     expires_at INT
// );
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


// Function to retrieve a user by Discord ID
async function getStravaUser(discordId) {
    const query = `SELECT * FROM strava_users WHERE discord_id = $1;`;
    const result = await pool.query(query, [discordId]);
    return result.rows[0];
}

// Function to store user preferences
async function storePreferences(discordId, hideLink, showMap) {
    const query = `
        INSERT INTO user_preferences (discord_id, hide_link, show_map)
        VALUES ($1, $2, $3)
        ON CONFLICT (discord_id) 
        DO UPDATE SET hide_link = $2, show_map = $3;
    `;
    await pool.query(query, [discordId, hideLink, showMap]);
}

// Function to get user preferences
async function getPreferences(discordId) {
    const query = `SELECT * FROM user_preferences WHERE discord_id = $1;`;
    const result = await pool.query(query, [discordId]);
    return result.rows[0];
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

// Function to delete user activity
async function deleteActivity(activity_id, owner_id) {
    const query = `DELETE FROM activities WHERE id = $1 AND strava_id = $2;`;
    await pool.query(query, [activity_id, owner_id]);
}


module.exports = {
    storeStravaUser,
    storeOauth,
    getStravaUser,
    storePreferences,
    getPreferences,
    saveActivity,
    deleteActivity,
    pool
};
