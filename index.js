require('dotenv').config();
const express = require('express');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const FormData = require('form-data');
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

    if (type === InteractionType.APPLICATION_COMMAND && data.name === 'share') {
        const inputUrl = data.options[0].value;

        const directVideoUrl = transformUrl(inputUrl);

        if (!directVideoUrl) {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'Could not process the Instagram link provided.' },
            });
        }

        const videoFilename = `video-${Date.now()}.mp4`;
        const filePath = `/tmp/${videoFilename}`;

        try {
            await downloadVideo(directVideoUrl, filePath);

            await sendVideoToDiscord(member.user.id, filePath);

            fs.unlinkSync(filePath);

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'Your video has been sent!' },
            });
        } catch (error) {
            console.error('Error handling Instagram video:', error);
            return res.status(500).send({ content: 'Failed to handle the Instagram video.' });
        }
    } else {
        console.log('Unhandled interaction type:', type);
    }
});

const transformUrl = (inputUrl) => {
    const match = inputUrl.match(/instagram.com\/([a-zA-Z]+)\/([^\/]+)/);
    if (match) {
        return `https://scontent.cdninstagram.com/v/t66.30100-16/323886538_923719352741964_3406324362302622841_n.mp4?_nc_ht=instagram.flpb2-1.fna.fbcdn.net&_nc_cat=100&_nc_ohc=gitM4VhMOeUAX_o3rVh&edm=AP_V10EBAAAA&ccb=7-5&oh=00_AfAfuq-RFZA-ZU8x5H2kDxgbYSf4G8M3L7vcPgNiXj6p6A&oe=65E99153&_nc_sid=2999b8&dl=0`.replace('instagram.flpb2-1.fna.fbcdn.net', match[1]);
    }
    return null;
};

const downloadVideo = (url, filePath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => reject(err));
        });
    });
};

const sendVideoToDiscord = async (userId, filePath) => {
    const formData = new FormData();
    formData.append('files[0]', fs.createReadStream(filePath));

    await discordApi.post(`/channels/${userId}/messages`, formData, {
        headers: {
            ...formData.getHeaders(),
        },
    });
};

// The rest of your server setup remains unchanged...

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));