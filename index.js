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

app.post('/interactions', verifyMiddleware, async (req, res) => {
    const { type, data, member } = req.body;
    if (type === InteractionType.APPLICATION_COMMAND) {
        if (data.name === 'share') {
            const url = data.options[0].value;
            try {
                const directVideoUrl = await transformUrl(url);
                if (!directVideoUrl) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: 'Failed to transform Instagram link to a direct video URL.' },
                    });
                }
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `Here is the direct link to the Instagram video: ${directVideoUrl}` },
                });
            } catch (error) {
                console.error('Error processing request:', error);
                return res.status(500).send({ content: 'An error occurred while processing your request.' });
            }
        }
    } else {
        console.log('Unhandled interaction type:', type);
    }
});

async function transformUrl(inputUrl) {
    try {
        const response = await axios.post('API_ENDPOINT', { url: inputUrl }, {
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': '11065a7860mshec01a2819b36eb5p19a0b0jsn486f7bfb9946',
                'X-RapidAPI-Host': 'instagram120.p.rapidapi.com',
            },
        });
        return response.data.directVideoUrl;
    } catch (error) {
        console.error('Error transforming URL with API:', error);
        return null;
    }
}

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
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
