require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const admin = require('firebase-admin');

const firebasePrivateKey = "AIzaSyCIQETZPJ49n51ZiKDpHO2vvynL2qZyt7g";

const firebaseConfig = {
	apiKey: "AIzaSyCIQETZPJ49n51ZiKDpHO2vvynL2qZyt7g",
	authDomain: "distant-8bf0b.firebaseapp.com",
	projectId: "distant-8bf0b",
	storageBucket: "distant-8bf0b.appspot.com",
	messagingSenderId: "923400850699",
	appId: "1:923400850699:web:dd5ab78e3be598214d260e",
	measurementId: "G-HF6JE9R4F3"
};
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: "distant-8bf0b",
        clientEmail: "leminemahjoub@gmail.com",
        privateKey: "AIzaSyCIQETZPJ49n51ZiKDpHO2vvynL2qZyt7g",
    }),
	databaseURL: "https://distant-8bf0b-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

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
            const usersSnapshot = await db.collection('users').orderBy('totalUpvotesGiven', 'desc').limit(10).get();
            const userLeaderboard = usersSnapshot.docs
                .map((doc, index) => `${index + 1}. <@${doc.id}> with ${doc.data().totalUpvotesGiven} upvotes`)
                .join('\n');

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `Top users by upvotes:\n${userLeaderboard}` },
            });
        }
    } else if (type === InteractionType.MESSAGE_COMPONENT) {
        const [action, postId] = requestData.custom_id.split('_');
        if (action === 'upvote') {
            const postRef = db.collection('posts').doc(postId);
            await db.runTransaction(async (transaction) => {
                const postDoc = await transaction.get(postRef);
                const post = postDoc.data();
                transaction.update(postRef, {
                    upvotes: admin.firestore.FieldValue.increment(1),
                    users: admin.firestore.FieldValue.arrayUnion(member.user.id)
                });

                const userRef = db.collection('users').doc(member.user.id);
                transaction.set(userRef, { totalUpvotesGiven: admin.firestore.FieldValue.increment(1) }, { merge: true });
            }).then(() => {
                res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `<@${member.user.id}> upvoted!` },
                });
            }).catch(() => {
                res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `You've already upvoted this post, <@${member.user.id}>!` },
                });
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
            name: "topuser",
            description: "Displays the leaderboard of users with the most upvotes given",
            options: [],
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
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=2048&scope=bot+applications.commands`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));