const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('preferences')
        .setDescription('RunStats visibility settings'),
    async execute(interaction) {
        await interaction.reply({ 
            content: 'TBD',
            flags: MessageFlags.Ephemeral
        });
    }
};