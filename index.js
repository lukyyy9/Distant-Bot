require('dotenv').config();
const express = require('express');
const axios = require('axios');
const utils = require('./utils.js');
const db = require('./firebase.js');
const fs = require('fs');
const path = require('path');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
app.use(express.json());

let youtubeApiKey = process.env.YOUTUBE_API_KEY;

const discordApi = axios.create({
    baseURL: 'https://discord.com/api/',
    headers: {
        "Authorization": `Bot ${process.env.TOKEN}`,
    },
});

const verifyMiddleware = verifyKeyMiddleware(process.env.PUBLIC_KEY);

const dataFilePath = path.join(__dirname, 'upvote.json');

app.post('/interactions', verifyMiddleware, async (req, res) => {
    const { type, data: requestData, member } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {

        if (requestData.name === 'ping') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Pong ${member.user.username}! 🏓`,
                    flags: 64
                },
            });

        } else if (requestData.name === 'video') {
            let url = requestData.options[0].value;
            let videoType = '';
            switch (utils.getService(url) + '.') {
                case 'instagram.': url = url.replace('instagram.', 'ddinstagram.'); videoType = 'Reel'; break;
                case 'tiktok.':
                    if(url.includes('vm.tiktok')){
                        url = await utils.getRidOfVmTiktok(url);
                    }
                    url = url.replace('tiktok.', 'vxtiktok.');
                    videoType = 'TikTok';
                    break;
                case 'twitter.': url = url.replace('twitter.', 'fxtwitter.'); videoType = 'X'; break;
                case 'x.': url = url.replace('x.', 'fxtwitter.'); videoType = 'X'; break;
                default: videoType = 'Video'; break;
            }
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `[${videoType}](${url}) shared by <@${member.user.id}>:`,
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            style: 1,
                            label: '❤',
                            custom_id: `upvote_${requestData.options[0].value}`,
                        }]
                    }]
                }
            });

        } else if (requestData.name === 'music') {
            let url = requestData.options[0].value;
            const service = utils.getService(url);
            let trackDetails;
            let spotifyAccessToken = await utils.getSpotifyAccessToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
            let spotifyLink = '';
            let youtubeLink = '';
            let deezerLink = '';
            let musicWord = 'Music';
            let components = [];
            if (service === 'spotify') {
                trackDetails = await utils.getTrackDetailsFromSpotify(url, spotifyAccessToken);
                spotifyLink = url;
            } else if (service === 'youtube') {
                trackDetails = await utils.getTrackDetailsFromYouTube(url, youtubeApiKey);
                youtubeLink = url;
            } else if (service === 'deezer') {
                trackDetails = await utils.getTrackDetailsFromDeezer(url);
                deezerLink = url;
            }
            else {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `This platform is not supported yet. Please use a valid music streaming service link.`,
                        flags: 64
                    }
                });
            }
            [spotifyLink, youtubeLink, deezerLink] = await Promise.all([
                spotifyLink === '' ? utils.searchOnSpotify(trackDetails, spotifyAccessToken) : Promise.resolve(spotifyLink),
                youtubeLink === '' ? utils.searchOnYouTube(trackDetails, youtubeApiKey) : Promise.resolve(youtubeLink),
                deezerLink === '' ? utils.searchOnDeezer(trackDetails) : Promise.resolve(deezerLink)
            ]);
            if (spotifyLink) {
                components.push({
                    type: 2,
                    style: 5,
                    label: 'Spotify',
                    url: spotifyLink,
                });
                musicWord = `[Music](${spotifyLink})`;
            }
            if (youtubeLink) {
                components.push({
                    type: 2,
                    style: 5,
                    label: 'YouTube',
                    url: youtubeLink,
                });
            }
            if (deezerLink) {
                components.push({
                    type: 2,
                    style: 5,
                    label: 'Deezer',
                    url: deezerLink,
                });
            }
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `${musicWord} shared by <@${member.user.id}>:\n${trackDetails.title} by ${trackDetails.artist}`,
                    components: [{
                        type: 1,
                        components: components
                    }]
                }
            });
        }

		else if (requestData.name === 'topuser') {
			let topuser = await utils.getTopUser();

			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `Top user: <@${topuser}>`,
				}
			});
		}



    } else if (type === InteractionType.MESSAGE_COMPONENT) {

		const [action, postId] = requestData.custom_id.split('_');
		const post = String(postId)
        const userId = String(member.user.id);

        if (action === 'upvote') {
			utils.upvotePost(post, userId);
			return res.send({
					type: InteractionResponseType.UPDATE_MESSAGE,
					data: {
						content: `Post upvoted by <@${member.user.id}>`,
					}
				});
        }
    }
});



app.get('/register_commands', async (req, res) => {
    const slashCommands = [
        {
            name: "ping",
            description: "Pings Distant",
            options: [],
        },
        {
            name: "video",
            description: "Sends video from a social media post",
            options: [{
                name: "url",
                description: "Social network post link",
                type: 3,
                required: true,
            }],
        },
        {
            name: "music",
            description: "Sends the music link from all music streaming services",
            options: [{
                name: "url",
                description: "Music streaming service title link",
                type: 3,
                required: true,
            }],
        },
        {
            name: "topuser",
            description: "Displays the leaderboard of users with the most upvotes given",
            options: []
		},
    ];
    //Get global commands
    try {
        await discordApi.get(`/applications/${process.env.APPLICATION_ID}/commands`);
    } catch (error) {
        console.error('Error getting global commands:', error);
    }
    //Delete each global commands
    try {
        const response = await discordApi.get(`/applications/${process.env.APPLICATION_ID}/commands`);
        const commands = response.data;
        for (const command of commands) {
            await discordApi.delete(`/applications/${process.env.APPLICATION_ID}/commands/${command.id}`);
        }
    } catch (error) {
        console.error('Error deleting global commands:', error);
    }
    // Register global commands
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