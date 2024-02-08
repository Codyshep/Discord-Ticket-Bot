require('dotenv').config();
const { Client, IntentsBitField, ChannelType, PermissionsBitField, roleMention, InteractionCollector, Message} = require('discord.js')

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'latency') {
        const ping = Date.now() - interaction.createdTimestamp;
        await interaction.reply(`Latency is ${ping}ms`);
    }

    if (interaction.commandName === 'create-ticket') {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        try {
            const channel = await guild.channels.create({
                name: `${interaction.user.username}'s Ticket`, /* `${interaction.user.username}'s ticket` */
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: process.env.SUPPORT_ROLE_ID,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            await channel.send(`${roleMention(process.env.SUPPORT_ROLE_ID)} Will Be With You Shortly.`);
            await channel.send(`Feel free to use /close-ticket when you are done.`);

            await interaction.reply('Ticket channel created successfully.');
            
        } catch (error) {
            console.error('Error creating channel:', error);
            await interaction.reply('Error creating ticket channel.');
        }
    }

    if (interaction.commandName === 'close-ticket') {
        const channel = interaction.channel;
        if (channel.name.endsWith('-ticket')) {
            try {
                await channel.delete();
                await interaction.reply('Ticket closed successfully.');
            } catch (error) {
                console.error('Error closing ticket:', error);
                await interaction.reply('Error closing ticket. Please try again later.');
            }
        } else {
            await interaction.reply('This command can only be used in ticket channels.');
        }
    }    
});

client.on('ready', (c) =>{
    console.log(`${c.user.username} Online!`)
})

client.login(process.env.TOKEN);