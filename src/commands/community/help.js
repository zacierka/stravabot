const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View the help page'),
        async execute (interaction) {
            const embed = new EmbedBuilder()
            .setTitle('Manual | Help')
            .setDescription('> /join | Link your Strava account, to see your runs in Discord.\n \
                > /leave | Unlink your strava account\n \
                > /settings | Configure privacy settings for activities\n \
                > /me | See your running statistics\n \
                > /leaderboards | See leaderboard statistics\n \
                ');
            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        }
}