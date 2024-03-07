require('dotenv').config();
const { Client, Intents } = require('discord.js');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);

    // Enregistrement global des commandes
    const data = [
        {
            name: 'ping',
            description: 'Répond avec Pong!',
        },
        {
            name: 'video',
            description: 'Envoie une vidéo à partir d’un post de médias sociaux',
            options: [{
                name: 'url',
                description: 'Lien du post sur les réseaux sociaux',
                type: 'STRING',
                required: true,
            }],
        },
    ];

    await client.application?.commands.set(data);
    console.log('Les commandes slash globales ont été enregistrées.');
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'ping':
            await interaction.reply(`Pong! 🏓`);
            break;
        case 'video':
            let url = data.options[0].value;
            let videoType = '';
            switch (new URL(url).hostname.replace('www.', '').split('.')[0].toLowerCase()+'.'){
                case platform.Instagram:
                    url = url.replace(platform.Instagram, altPlatform.Instagram);
                    videoType = 'Reel';
                    break;
                case platform.TikTok:
                    url = url.replace(platform.TikTok, altPlatform.TikTok);
                    videoType = 'TikTok';
                    break;
                case platform.Twitter:
                    url = url.replace(platform.Twitter, altPlatform.TwitterX);
                    videoType = 'X';
                    break;
                case platform.X:
                    url = url.replace(platform.X, altPlatform.TwitterX);
                    videoType = 'X';
                    break;
                default:
                    videoType = new URL(url).hostname + ' video';
                    break;
            }
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `[${videoType}](${url}) shared by ${member.user.username}:` },
            });
            break;
    }
});

client.login(process.env.TOKEN);

app.get('/', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=2048&scope=bot+applications.commands`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

client.application?.commands.create({
    name: 'ping',
    description: 'Pings Distant'
});

client.application?.commands.create({
    name: 'video',
    description: 'Sends video from a social media post',
    options: [{
        name: 'url',
        description: 'Social network post link',
        type: 'STRING',
        required: true,
    }]
});
