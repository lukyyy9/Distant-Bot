require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();

const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';

const discord_api = axios.create({
	baseURL: 'https://discord.com/api/',
	timeout: 3000,
	headers: {
		"Authorization": `Bot ${TOKEN}`
	}
});

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
	const interaction = req.body;

	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		switch (interaction.data.name) {
		case 'ping':
			res.send({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `Pong ${interaction.member.user.username}! 🏓`,
			},
			});
			break;

		case 'share':
			let url = interaction.data.options[0].value;
			let match = url.match(/instagram.com\/([a-zA-Z]+)\/([^\/]+)/);

			if (!match) {
			res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
				content: 'Invalid Instagram post link'
				}
			});
			return;
			}

			let post_id = match[2];
			try {
			const response = await axios.post('https://instagram120.p.rapidapi.com/api/instagram/links',
			{ url: 'https://www.instagram.com/p/' + post_id },
			{
				headers: {
				'content-type': 'application/json',
				'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
				'X-RapidAPI-Host': 'instagram120.p.rapidapi.com'
				}
			});

			res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
				content: `Here is the [link](${response.data[0].urls[0].url}) of your Instagram video.\n🛠️ Streaming through the desktop client is not supported yet. 🛠️`
				},
			});
			} catch (error) {
			console.error(error);
			res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
				content: 'Failed to fetch Instagram post link'
				}
			});
			}
			break;
		}
	}
});

app.get('/register_commands', async (req, res) => {
    let slash_commands = [
		{
			"name": "ping",
			"description": "pings Distant",
			"options": []
		},
		{
			"name": "share",
			"description": "sends media from an Instagram post",
			"options": [
				{
					"name": "url",
					"description": "Instagram post link",
					"type": 3,
					"required": true
				}
			]
		}
	];

	try {
    let discord_response = await discord_api.put(
        `/applications/${APPLICATION_ID}/commands`,
        slash_commands
    );

    console.log(discord_response.data);
    res.send('Global commands have been registered');
	} catch (error) {
    console.error(error.code);
    console.error(error.response?.data);
    res.status(500).send(`${error.code} error from Discord`);
	}
});

app.get('/', (req, res) => {
	res.redirect(`https://discord.com/oauth2/authorize?client_id=1212077510431608973&permissions=2048&redirect_uri=https%3A%2F%2Ferin-awful-duckling.cyclic.app&scope=applications.commands+bot`);
});

app.listen(8999, () => {
	console.log('Server started on port 8999');
});
