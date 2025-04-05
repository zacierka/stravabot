const { MessageFlags } = require('discord.js');
async function handleModalCommand(client, interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'settingsModal') {
        const hideLink = interaction.fields.getTextInputValue('hideLink') === 'true';
        const showMap = interaction.fields.getTextInputValue('showMap') === 'true';

        // Store these settings (replace with database logic)
        console.log(`User ${interaction.user.id} Preferences: hideLink=${hideLink}, showMap=${showMap}`);

        await interaction.reply({ content: 'Preferences saved!', ephemeral: true });
    }
}

async function handleChatCommand(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
}

async function handleButtonCommand(client, interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('strava-authorization-btn')) {
        // When a user presses the authorize button
        console.log(`${interaction.user.id} started authentication`);
        
    }
}

module.exports = { handleModalCommand, handleChatCommand, handleButtonCommand }