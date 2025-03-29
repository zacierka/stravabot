const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('this is a ping command'),
        async execute (interaction) {
            await interaction.reply({ content: 'pong!' });
        }
}