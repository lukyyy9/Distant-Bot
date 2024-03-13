require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
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

    if (type === InteractionType.APPLICATION_COMMAND) {
        if (requestData.name === 'ping') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `Pong ${member.user.username}! 🏓` },
            });
        } else if (requestData.name === 'video') {
            let url = requestData.options[0].value;
            let videoType = '';
            switch (new URL(url).hostname.replace('www.', '').split('.')[0].toLowerCase() + '.') {
                case 'instagram.': url = url.replace('instagram.', 'ddinstagram.'); videoType = 'Reel'; break;
                case 'tiktok.': url = url.replace('tiktok.', 'vxtiktok.'); videoType = 'TikTok'; break;
                case 'twitter.': url = url.replace('twitter.', 'fxtwitter.'); videoType = 'X'; break;
                case 'x.': url = url.replace('x.', 'fxtwitter.'); videoType = 'X'; break;
                default: videoType = new URL(url).hostname + ' video'; break;
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
        } else if (requestData.name === 'topuser') {
            const userLeaderboard = Object.entries(data.users)
                .sort(([, a], [, b]) => b.totalUpvotesGiven - a.totalUpvotesGiven)
                .slice(0, 10)
                .map(([userId, { totalUpvotesGiven }], index) => `${index + 1}. <@${userId}> with ${totalUpvotesGiven} upvotes`)
                .join('\n');

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `Top users by upvotes:\n${userLeaderboard}` },
            });
        } else if (requestData.name === 'spotify' || requestData.name === 'deezer' || requestData.name === 'applemusic') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `${member.user.username} used the ${requestData.name} command` },
            }); // Temporary return !
        }
    } else if (type === InteractionType.MESSAGE_COMPONENT) {
        const [action, postId] = requestData.custom_id.split('_');
        if (action === 'upvote') {
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
                    data: { content: `<@${member.user.id}> upvoted! Total upvotes: ${post.upvotes}` },
                });
            } else {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `You've already upvoted this post, <@${member.user.id}>!` },
                });
            }
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
            description: "Sends the video from a social media post",
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
            options: [],
        },
        {
            name: "topuser",
            description: "Displays the leaderboard of users with the most upvotes given",
            options: [],
        },
        
    ];

    try {
        const existingCommandsResponse = await axios.get(`/applications/${process.env.APPLICATION_ID}/commands`);
        const existingCommands = existingCommandsResponse.data;
        const commandsToDelete = existingCommands.filter(command => 
            !slashCommands.some(newCommand => newCommand.name === command.name));
        for (const command of commandsToDelete) {
            await axios.delete(`/applications/${process.env.APPLICATION_ID}/commands/${command.id}`);
        }
        await axios.put(`/applications/${process.env.APPLICATION_ID}/commands`, slashCommands);
        console.log('Global commands have been updated successfully');
    } catch (error) {
        console.error('Error updating commands:', error);
    }
});

app.get('/', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=2048&scope=bot+applications.commands`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));