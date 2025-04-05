const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('preferences')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('RunStats visibility settings'),
    async execute(interaction) {
        await interaction.reply({ 
            content: 'TBD',
            flags: MessageFlags.Ephemeral
        });
    }
};