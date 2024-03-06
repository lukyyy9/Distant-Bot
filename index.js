require('dotenv').config();
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Parse JSON bodies

const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

// Middleware for Discord interactions
app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
    const { type, data, member } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {
        if (data.name === 'share') {
            const url = data.options?.find(option => option.name === 'url')?.value;

            // Validate the URL
            if (!url || !url.includes('instagram.com')) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'Please provide a valid Instagram video link.',
                    },
                });
            }

            // Respond with the Instagram video link
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Here's the Instagram video link shared by ${member.user.username}: ${url}`,
                },
            });
        }
    }
});

app.get('/register_commands', async (req, res) => {
    const axios = require('axios');
    const discord_api = axios.create({
        baseURL: 'https://discord.com/api/',
        headers: { "Authorization": `Bot ${TOKEN}` }
    });

    const slash_commands = [
        {
            name: "share",
            description: "Share an Instagram video link",
            options: [{
                name: "url",
                description: "The Instagram video link",
                type: 3, // STRING
                required: true
            }]
        }
    ];

    try {
        await discord_api.put(`/applications/${APPLICATION_ID}/commands`, slash_commands);
        console.log('Global commands have been registered.');
        res.send('Global commands have been registered.');
    } catch (error) {
        console.error('Failed to register commands:', error);
        res.status(500).send('Failed to register commands.');
    }
});

app.get('/', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${APPLICATION_ID}&permissions=2048&redirect_uri=https%3A%2F%2Fyourredirecturi.com&scope=applications.commands+bot`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});