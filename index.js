require('dotenv').config();
const { Client, Intents } = require('discord.js');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);

    // Enregistrement global des commandes
    const data = [
        {
            name: 'ping',
            description: 'Répond avec Pong!',
        },
        {
            name: 'video',
            description: 'Envoie une vidéo à partir d’un post de médias sociaux',
            options: [{
                name: 'url',
                description: 'Lien du post sur les réseaux sociaux',
                type: 'STRING',
                required: true,
            }],
        },
    ];

    await client.application?.commands.set(data);
    console.log('Les commandes slash globales ont été enregistrées.');
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply(`Pong! 🏓`);
    } else if (commandName === 'video') {
        let url = interaction.options.getString('url');
        // Votre logique pour traiter l'URL de la vidéo va ici
        await interaction.reply(`Vidéo traitée: ${url}`);
    }
});

client.login(process.env.TOKEN);

app.get('/', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=2048&scope=bot+applications.commands`);
});

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Vous devriez également enregistrer vos commandes slash, soit via un script séparé, soit au démarrage de votre application
client.application?.commands.create({
    name: 'ping',
    description: 'Pings Distant'
});

client.application?.commands.create({
    name: 'video',
    description: 'Sends video from a social media post',
    options: [{
        name: 'url',
        description: 'Social network post link',
        type: 'STRING',
        required: true,
    }]
});
