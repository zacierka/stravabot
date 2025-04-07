const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Authenticate with Strava to link your account'),
    async execute(interaction) {
        const authorId = interaction.user.id;
        const clientId = process.env.STRAVA_CLIENT_ID;
        const redirectUri = encodeURIComponent(`${REDIRECT_URI}/callback?discordId=${authorId}`);
        const scope = 'activity:read';
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${authorId}&scope=${scope}&approval_prompt=force`;

        const button = new ButtonBuilder()
            .setLabel('Link Strava')
            .setStyle(ButtonStyle.Link)
            .setURL(authUrl);

        const response = await interaction.reply({ 
            content: 'Click the button below to link your Strava account:',
            components: [new ActionRowBuilder().addComponents(button)],
            fetchReply: true,
            flags: MessageFlags.Ephemeral
        });
    }
};