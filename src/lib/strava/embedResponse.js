const { EmbedBuilder } = require('discord.js');

module.exports = (activity) => {
    return new EmbedBuilder()
    .setTitle(`New Activity by ${activity.athlete.firstname} ${activity.athlete.lastname}`)
    .setDescription(`**${activity.name}**`)
    .addFields(
        { name: "Distance", value: `${metersToMiles(activity.distance)} mi`, inline: true },
        { name: "Duration", value: `${secondsToMinSec(activity.moving_time)}`, inline: true },
        { name: "Pace", value: `${calculatePace(activity.distance, activity.moving_time)} /mi`, inline: true },
        { name: "Elevation Gain", value: `${metersToFeet(activity.total_elevation_gain)} ft`, inline: true },
        { name: "View on Strava", value: `https://www.strava.com/activities/${activity.id}`, inline: false }
    )
    .setTimestamp()
    .setColor(0xFC4C02) // Strava orange
    .setFooter({ text: "Strava Activity Bot" });
}

// Helper functions
function metersToMiles(meters) {
    return (meters / 1609.34).toFixed(2);
}

function metersToFeet(meters) {
    return (meters * 3.28084).toFixed(0);
}

function secondsToMinSec(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function calculatePace(distanceMeters, timeSeconds) {
    const miles = distanceMeters / 1609.34;
    const paceSecondsPerMile = timeSeconds / miles;
    return secondsToMinSec(paceSecondsPerMile);
}