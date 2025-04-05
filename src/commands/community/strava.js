const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava')
        .setDescription('Connect with Strava')
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Link your Strava with Discord!')
        )
        .addSubcommand(subcommand =>
            subcommand
              .setName('privacy')
              .setDescription('Set your activity visibility settings')
              .addBooleanOption(option =>
                option
                  .setName('visible')
                  .setDescription('Show Strava URL on activity?')
                  .setRequired(true)
              )
          ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'link') {
            const authorId = interaction.user.id;
            const clientId = process.env.STRAVA_CLIENTID;
            const redirectUri = encodeURIComponent(`${REDIRECT_URI}/callback?discordId=${authorId}`);
            const scope = 'activity:read'; // Adjust scope based on your needs.... FIX: no scope passed in here.
            const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${authorId}&scope=${scope}&approval_prompt=force`;

            const button = new ButtonBuilder()
                .setLabel('Link Strava')
                .setStyle(ButtonStyle.Link)
                .setURL(authUrl);

            await interaction.reply({
                content: 'Click the button below to link your Strava account:',
                components: [new ActionRowBuilder().addComponents(button)],
                flags: MessageFlags.Ephemeral
            });
        }else if (interaction.options.getSubcommand() === 'privacy') {
            const choice = interaction.options.getBoolean('visible');
            console.log(`User ${interaction.user.id} set their Strava visibility to ${choice}`);
            interaction.reply({
                content: `Your Strava activity preferences have been updated. On your next activity you \
                ${choice ? "should" : "should not"} see a link to your Strava.`,
                flags: MessageFlags.Ephemeral
            });
        }
    }

};