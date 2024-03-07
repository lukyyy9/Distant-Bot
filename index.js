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
let sentMessage = null;

app.post('/interactions', verifyMiddleware, async (req, res) => {
    const { type, data, member } = req.body;

switch (type) {
    case InteractionType.APPLICATION_COMMAND:
        switch (data.name) {
            case 'ping':
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `Pong ${member.user.username}! 🏓\n${sentMessage.id}` },
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
                    // L'ID du message est contenu dans la réponse
                    const messageId = response.data.id;
            
                    // Sauvegardez l'ID du message et l'ID de l'utilisateur qui a partagé la vidéo
                    //saveMessageId(messageId, member.user.id);
                    console.log('Message ID:', messageId);
                    console.log('User ID:', member.user.id);
            
                    // Réponse à l'interaction Discord pour confirmer la réception
                    return res.send({
                        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                    });
                }).catch(error => {
                    console.error("Erreur lors de l'envoi du message :", error);
                    // Gérer l'erreur appropriément
                    return res.status(500).send({ error: 'Erreur interne du serveur' });
                });
                break;

    case InteractionType.MESSAGE_COMPONENT:
        switch (data.custom_id) {
            case 'upvote':
                console.log('upvote');
                return res.send({
                    //todo: update message with upvote count
                });
            case 'downvote':
                console.log('downvote');
                return res.send({
                    //todo: update message with downvote count
                });
        }
        break;
}
});

app.get('/register_commands', async (req, res) => {
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
        },
        /*{
            "name": "music",
            "description": "Sends all the platfomrs links for the music link provided",
            "options": [{
                "name": "url",
                "description": "Streaming service music link",
                "type": 3,
                "required": true,
            }],
        }*/
    ];

    try {
        await discordApi.put(`/applications/${process.env.APPLICATION_ID}/commands`, slashCommands);
        res.send('Global commands have been registered');
    } catch (error) {
        console.error('Error registering commands:', error);
        res.status(500).send('Error registering global commands');
    }
});

app.get('/', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=1212077510431608973&permissions=2048&scope=bot+applications.commands`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));