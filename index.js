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

                case 'share':
                    let url = data.options[0].value;
                    let videoType = '';
                    let urlObject = new URL(url);
                    let domain = urlObject.hostname.replace('www.', '').replace('.com', '');
                    switch (domain) {
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
                            break;
                    }
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: `[${videoType}](${url}) shared by ${member.user.username}:` },
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
            "name": "share",
            "description": "Sends media from an Instagram post",
            "options": [{
                "name": "url",
                "description": "Instagram post link",
                "type": 3,
                "required": true,
            }],
        },
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
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&permissions=2048&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=applications.commands+bot`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));