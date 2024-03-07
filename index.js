require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
app.use(express.json());

const discordApi = axios.create({
    baseURL: 'https://discord.com/api/',
    headers: {
        "Authorization": `Bot ${process.env.TOKEN}`,
    },
});

const verifyMiddleware = verifyKeyMiddleware(process.env.PUBLIC_KEY);

const platform = {
    Instagram: 'instagram.',
    TikTok: 'tiktok.',
    Twitter: 'twitter.',
    X: 'x.'
};
const altPlatform = {
    Instagram: 'ddinstagram.',
    TikTok: 'vxtiktok.',
    TwitterX: 'fxtwitter.'
};

app.post('/interactions', verifyMiddleware, async (req, res) => {
    const { type, data, member } = req.body;

    switch (type) {
        case InteractionType.APPLICATION_COMMAND:
            switch (data.name) {
                case 'ping':
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: `Pong ${member.user.username}! 🏓` },
                    });

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
                            videoType = videoType.charAt(0).toUpperCase() + videoType.slice(1);
                            break;
                    }

                    return res.send({
                        content: `[${videoType}](${url}) shared by ${member.user.username}:\n👍 0 | 👎 0`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        style: 1,
                                        label: 'Upvote',
                                        custom_id: 'upvote',
                                        emoji: {
                                            name: '👍'
                                        }
                                    },
                                    {
                                        type: 2,
                                        style: 1,
                                        label: 'Downvote',
                                        custom_id: 'downvote',
                                        emoji: {
                                            name: '👎'
                                        }
                                    }
                                ]
                            }
                        ]
                    }).then(response => {
                        console.log('Message ID:', response.data.id);
                        console.log('User ID:', member.user.id);
                    }).catch(error => {
                        console.error("Erreur lors de l'envoi du message :", error);
                        return res.status(500).send({ error: 'Erreur interne du serveur' });
                    });
            }
            break;

        case InteractionType.MESSAGE_COMPONENT:
            switch (data.custom_id) {
                case 'upvote':
                    console.log('upvote');
                    break;
                case 'downvote':
                    console.log('downvote');
                    break;
            }
            break;
    }
});

app.get('/register_commands', async (_, res) => {
    const slashCommands = [
        {
            "name": "ping",
            "description": "Pings Distant",
            "options": [],
        },
        {
            "name": "video",
            "description": "Sends video from a social media post",
            "options": [{
                "name": "url",
                "description": "Social network post link",
                "type": 3,
                "required": true,
            }],
        }
    ];

    try {
        await discordApi.put(`/applications/${process.env.APPLICATION_ID}/commands`, slashCommands);
        res.send('Global commands have been registered');
    } catch (error) {
        console.error('Error registering commands:', error);
        res.status(500).send('Error registering global commands');
    }
});

app.get('/', (_, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=1212077510431608973&permissions=2048&scope=bot+applications.commands`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));