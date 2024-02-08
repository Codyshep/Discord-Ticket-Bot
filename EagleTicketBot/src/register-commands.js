require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { ApplicationCommandOptionType } = require('discord.js')

const commands = [
    {
        name: 'latency',
        description: 'Replies with the current latency for the bot.',
    },
    {
        name: 'create-ticket',
        description: 'Create a support ticket.',
    },
    {
        name: 'close-ticket',
        description: 'Closes the current ticket you are in.',
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Fetch existing commands
        const existingCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
        console.log('Existing commands:', existingCommands);

        // Compare existing commands with new commands
        const addedCommands = commands.filter(cmd => !existingCommands.some(ecmd => ecmd.name === cmd.name));
        const removedCommands = existingCommands.filter(ecmd => !commands.some(cmd => cmd.name === ecmd.name));
        const updatedCommands = commands.filter(cmd => {
            const existingCmd = existingCommands.find(ecmd => ecmd.name === cmd.name);
            return existingCmd && JSON.stringify(existingCmd) !== JSON.stringify(cmd);
        });

        // Log changes
        console.log('Added commands:', addedCommands);
        console.log('Removed commands:', removedCommands);
        console.log('Updated commands:', updatedCommands);

        // Register new commands if there are changes
        if (addedCommands.length > 0 || removedCommands.length > 0 || updatedCommands.length > 0) {
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            console.log('Successfully registered application (/) commands.');
        } else {
            console.log('No changes detected in application (/) commands.');
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();
