const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View the help page'),
        async execute (interaction) {
            const embed = new EmbedBuilder()
            .setTitle('Manual | Help')
            .setDescription('> /strava link | Link your Strava account, to see your runs in Discord.');
            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        }
}