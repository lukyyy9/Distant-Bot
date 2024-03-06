
// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const https = require('https');

const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 


const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});




app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)
    if(interaction.data.name == 'ping'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Pong ${interaction.member.user.username}! 🏓`,
        },
      });
    }

    /*
    if(interaction.data.name == 'dm'){
      // https://discord.com/developers/docs/resources/user#create-dm
      let c = (await discord_api.post(`/users/@me/channels`,{
        recipient_id: interaction.member.user.id
      })).data
      try{
        // https://discord.com/developers/docs/resources/channel#create-message
        let res = await discord_api.post(`/channels/${c.id}/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
        console.log(res.data)
      }catch(e){
        console.log(e)
      }

      return res.send({
        // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          content:'👍'
        }
      });
    }
    */

    if (interaction.data.name == 'share') {
      let url = interaction.data.options[0].value
      let match = url.match(/instagram.com\/([a-zA-Z]+)\/([^\/]+)/);
      if (!match) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Invalid Instagram post link'
          }
        });
      }
      let post_id = match[2];
      let response = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'instagram120.p.rapidapi.com',
          path: '/api/instagram/links',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '11065a7860mshec01a2819b36eb5p19a0b0jsn486f7bfb9946',
            'X-RapidAPI-Host': 'instagram120.p.rapidapi.com'
          }
        }, res => {
          let data = '';
          res.on('data', chunk => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        });
        req.on('error', reject);
        req.write(JSON.stringify({ url: 'https://www.instagram.com/p/' + post_id }));
        req.end();
      });
      console.log('https://www.instagram.com/p/' + post_id);
      console.log(response[0].urls[0].url);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Here is the [link](${response[0].urls[0].url}) of your instagram video.\n🛠️ Streaming through the desktop client is not supported yet. 🛠️`
        },
      });
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
          "type": 3, // Type 3 correspond à un paramètre de type "STRING"
          "required": true
        }
      ]
    }
  ];

  try {
    // Modifier ici pour utiliser l'endpoint des commandes globales
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/commands`,
      slash_commands
    );

    console.log(discord_response.data);
    return res.send('Global commands have been registered');
  } catch (e) {
    console.error(e.code);
    console.error(e.response?.data);
    return res.send(`${e.code} error from Discord`);
  }
});


app.get('/', async (req,res) =>{
  //return res.send('Follow documentation ')
  return res.redirect(`https://discord.com/oauth2/authorize?client_id=1212077510431608973&permissions=2048&redirect_uri=https%3A%2F%2Ferin-awful-duckling.cyclic.app&scope=applications.commands+bot`)
})


app.listen(8999, () => {

})

