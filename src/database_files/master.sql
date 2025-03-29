-- athlete : json
CREATE TYPE SEX AS ENUM ('M', 'F');
CREATE TABLE IF NOT EXISTS strava_users (
    strava_id TEXT PRIMARY KEY,
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT,
    bio TEXT,
    city TEXT,
    `state` TEXT,
    country TEXT,
    sex SEX,
    premium BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    `weight` REAL,
    avatar TEXT
);

CREATE TABLE IF NOT EXISTS discord_guild_members (
    discord_id TEXT PRIMARY KEY,
    displayName TEXT,
    nickname TEXT,
    joined_at TIMESTAMPTZ,
    username TEXT
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
    user_id TEXT PRIMARY KEY,
    provider TEXT,
    token_type TEXT, 
    access_token TEXT,
    refresh_token TEXT, 
    expires_in INT,
    expires_at INT
);

CREATE TABLE IF NOT EXISTS runstats_preferences (
    discord_id TEXT PRIMARY KEY REFERENCES users(discord_id) ON DELETE CASCADE,
    show_strava_url BOOLEAN DEFAULT false,
    show_map_picture BOOLEAN DEFAULT false
);
