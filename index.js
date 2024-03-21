require('dotenv').config();
const express = require('express');
const axios = require('axios');
const utils = require('./utils.js');
const fs = require('fs');
const path = require('path');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
app.use(express.json());

// Initialize daily usage counter
let dailyUsageCounter = {};

// Function to reset daily usage counter at midnight
const resetDailyUsageCounter = () => {
    dailyUsageCounter = {};
    // Schedule the reset for the next midnight
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const delay = nextMidnight - now;
    setTimeout(resetDailyUsageCounter, delay);
};
// Schedule the initial reset
resetDailyUsageCounter();

let youtubeApiKey = process.env.YOUTUBE_API_KEY;

const discordApi = axios.create({
    baseURL: 'https://discord.com/api/',
    headers: {
        "Authorization": `Bot ${process.env.TOKEN}`,
    },
});

const verifyMiddleware = verifyKeyMiddleware(process.env.PUBLIC_KEY);

const dataFilePath = path.join(__dirname, 'upvote.json');

const loadData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading upvotes data file:', error);
        return { posts: {}, users: {} };
    }
};

const saveData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to upvotes data file:', error);
    }
};

let data = loadData();

app.post('/interactions', verifyMiddleware, async (req, res) => {
    const { type, data: requestData, member } = req.body;

    // Increment daily usage counter for the user
    if (member && member.user && member.user.id) {
        dailyUsageCounter[member.user.id] = (dailyUsageCounter[member.user.id] || 0) + 1;
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        // Handle application commands
        if (requestData.name === 'ping') {
            // Handle ping command
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Pong ${member.user.username}! 🏓`,
                    flags: 64
                },
            });
        } else if (requestData.name === 'video') {
            // Handle video command
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
            // Handle music command
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
            }
            if (youtubeLink) {
                components.push({
                    type: 2,
                    style: 5,
                    label: 'YouTube',
                    url: youtubeLink,
                });
                musicWord = `[Music](${youtubeLink})`;
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
        } else if (requestData.name === 'topuser') {
            // Handle topuser command
            const userLeaderboard = Object.entries(data.users)
                .sort(([, a], [, b]) => b.totalUpvotesGiven - a.totalUpvotesGiven)
                .slice(0, 10)
                .map(([userId, { totalUpvotesGiven }], index) => `${index + 1}. <@${userId}> with ${totalUpvotesGiven} upvotes`)
                .join('\n');

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content
                    : `Top users by upvotes:\n${userLeaderboard}` },
                });
            }
        } else if (type === InteractionType.MESSAGE_COMPONENT) {
            // Handle message components
            const [action, postId] = requestData.custom_id.split('_');
    
            if (action === 'upvote') {
                // Handle upvote action
                const post = data.posts[postId] || { upvotes: 0, users: [] };
                if (!post.users.includes(member.user.id)) {
                    post.upvotes += 1;
                    post.users.push(member.user.id);
                    data.posts[postId] = post;
    
                    data.users[member.user.id] = data.users[member.user.id] || { totalUpvotesGiven: 0 };
                    data.users[member.user.id].totalUpvotesGiven += 1;
    
                    saveData(data);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { 
                            content: `<@${member.user.id}> upvoted! Total upvotes: ${post.upvotes}`,
                            flags: 64
                        },
                    });
                } else {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { 
                            content: `You've already upvoted this post, <@${member.user.id}>!`,
                            flags: 64
                        },
                    });
                }
            }
        }
    });
    
    app.get('/register_commands', async (req, res) => {
        // Register slash commands
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
                options: [],
            },
        ];
    
        try {
            // Get global commands
            const response = await discordApi.get(`/applications/${process.env.APPLICATION_ID}/commands`);
            const commands = response.data;
    
            // Delete existing global commands
            for (const command of commands) {
                await discordApi.delete(`/applications/${process.env.APPLICATION_ID}/commands/${command.id}`);
            }
        } catch (error) {
            console.error('Error deleting global commands:', error);
        }
    
        try {
            // Register new global commands
            await discordApi.put(`/applications/${process.env.APPLICATION_ID}/commands`, slashCommands);
            res.send('Global commands have been registered');
        } catch (error) {
            console.error('Error registering commands:', error);
            res.status(500).send('Error registering global commands');
        }
    });
    
    app.get('/', (req, res) => {
        // Redirect to OAuth2 authorization link
        res.redirect(`https://discord.com/oauth2/authorize?client_id=1212077510431608973&permissions=2048&scope=bot+applications.commands`);
    });
    
    const PORT = process.env.PORT || 8999;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    