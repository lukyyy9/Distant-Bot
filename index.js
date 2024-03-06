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

	switch (type) {
		case InteractionType.APPLICATION_COMMAND:
			switch (data.name) {
				case 'ping':
					return res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: { content: `Pong ${member.user.username}! 🏓` },
					});

				case 'share':
					const url = data.options[0].value;
					const match = url.match(/instagram.com\/([a-zA-Z]+)\/([^\/]+)/);

					if (!match) {
						return res.send({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: { content: 'Invalid Instagram post link' },
						});
					}

					try {
						const response = await axios.post('https://instagram120.p.rapidapi.com/api/instagram/links', {
							url: 'https://www.instagram.com/p/' + match[2],
						}, {
							headers: {
								'X-RapidAPI-Key': '11065a7860mshec01a2819b36eb5p19a0b0jsn486f7bfb9946',
								'X-RapidAPI-Host': 'instagram120.p.rapidapi.com',
								'Content-Type': 'application/json',
							},
						});

						return res.send({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: { content: `Here is the [link](${response.data[0].urls[0].url}) of your Instagram video.\n🛠️ Streaming through the desktop client is not supported yet. 🛠️` },
						});
					} catch (error) {
						console.error('Error fetching Instagram data:', error);
						return res.status(500).send({ content: 'Failed to fetch Instagram data' });
					}
			}
			break;

		default:
			console.log('Unhandled interaction type:', type);
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
