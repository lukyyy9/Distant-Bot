const axios = require('axios'); // Ensure Axios is imported

async function getSpotifyAccessToken(clientId, clientSecret) {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials', // Data to be sent in the body
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching Spotify access token:', error);
    return null; // Or throw an error, depending on your error handling strategy
  }
}

async function getTrackDetailsFromSpotify(url, spotifyAccessToken) {
  const trackId = url.split('track/')[1].split('?')[0];
  const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      'Authorization': `Bearer ${spotifyAccessToken}`,
    },
  });
  const trackDetails = {
    artist: response.data.artists[0].name,
    title: response.data.name,
    album: response.data.album.name
  };
  return trackDetails;
}

async function getTrackDetailsFromYouTube(url, youtubeApiKey) {
  const videoId = new URL(url).searchParams.get('v');
  const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      part: 'snippet',
      id: videoId,
      key: youtubeApiKey,
    },
  });
  const trackDetails = {
    artist: response.data.items[0].snippet.channelTitle,
    title: response.data.items[0].snippet.title,
    album: ''
  };
  return trackDetails;
}

async function getTrackDetailsFromDeezer(url) {
  let trackId = '';
  if (url.includes('deezer.page.link')) {
      // Case 1: URL is a short link
      const fullPage = await axios.get(url);
      const urlExtractRegex = /https:\/\/www\.deezer\.com\/\w+\/track\/(\d+)/;
      const match = fullPage.data.match(urlExtractRegex);
      trackId = match[1];
  } else {
      // Case 2: URL is a full link
      trackId = url.split('track/')[1];
  }
  const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
  const trackDetails = {
    artist: response.data.artist.name,
    title: response.data.title,
    album: response.data.album.title
  };
  return trackDetails;
}

async function searchOnSpotify(trackDetails, spotifyAccessToken) {
  const response = await axios.get('https://api.spotify.com/v1/search', {
    headers: {
      'Authorization': `Bearer ${spotifyAccessToken}`,
    },
    params: {
      q: trackDetails,
      type: 'track',
      limit: 1,
    },
  });
  if (response.data.tracks.items.length > 0) {
    return `https://open.spotify.com/track/${response.data.tracks.items[0].id}`;
  }
  return null;
}

async function searchOnYouTube(trackDetails, youtubeApiKey) {
  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      q: trackDetails,
      type: 'video',
      maxResults: 1,
      key: youtubeApiKey,
    },
  });
  if (response.data.items.length > 0) {
    return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
  }
  return null;
}

async function searchOnDeezer(trackDetails) {
  const query = `artist:"${trackDetails.artist}" album:"${trackDetails.album}" track:"${trackDetails.title}"`;
  const response = await axios.get('https://api.deezer.com/search', {
    params: {
      q: query,
    },
  });
  if (response.data.data && response.data.data.length > 0) {
    return `https://www.deezer.com/track/${response.data.data[0].id}`;
  }
  return null;
}

function getService(url) {
  const hostname = new URL(url).hostname.replace('www.', '').split('.')[0].toLowerCase();
  if (url.includes('spotify') && hostname === "open") { //to avoid getting "open" instead of spotify as a service
    return 'spotify';
  }
  if (url.includes('tiktok') && hostname === "vm") { //to avoid getting "vm" instead of tiktok as a service
    return 'tiktok';
  }
  if (url.includes('youtu.be') && hostname === 'youtu') { // to handle youtu.be links
    return 'youtube';
  }
  return hostname;
}

async function getRidOfVmTiktok(url) {
    const response = await axios.get(url);
    const data = response.data;

    const usernameRegex = /"uniqueId":"([^"]*)"/;
    const usernameMatch = data.match(usernameRegex);
    const username = usernameMatch ? usernameMatch[1] : null;

    const videoIdRegex = /{"itemInfo":{"itemStruct":{"id":"([^"]*)"/;
    const videoIdMatch = data.match(videoIdRegex);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    return `https://www.tiktok.com/@${username}/video/${videoId}`;
}

module.exports = {
  getSpotifyAccessToken,
  getTrackDetailsFromSpotify,
  getTrackDetailsFromYouTube,
  getTrackDetailsFromDeezer,
  searchOnSpotify,
  searchOnDeezer,
  searchOnYouTube,
  getService,
  getRidOfVmTiktok,
};