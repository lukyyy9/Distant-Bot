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
    console.log(response.data);
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
  return `${response.data.name} ${response.data.artists.map(artist => artist.name).join(', ')}`;
}

async function getTrackDetailsFromYouTube(url, youtubeApiKey) {
  const videoId = url.split('watch?v=')[1].split('&')[0];
  const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
    params: {
      part: 'snippet',
      id: videoId,
      key: youtubeApiKey,
    },
  });
  return response.data.items[0].snippet.title;
}

async function getTrackDetailsFromDeezer(url) {
  let trackId = '';
  if (url.includes('deezer.page.link')) {
      // Case 1: URL is a short link
      const fullPage = await axios.get(url);
      const urlExtractRegex = /https:\/\/www\.deezer\.com\/\w+\/track\/(\d+)/;
      const match = fullPage.data.match(urlExtractRegex);
      if (match) {
          trackId = match[1];
      } else {
          console.log('No track ID found in the HTML content');
          return;
      }
  } else {
      // Case 2: URL is a full link
      trackId = url.split('track/')[1];
  }
  console.log('TRACKID DEEZER=' + trackId);
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
  return '';
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
  return '';
}

async function searchOnDeezer(trackDetails) {
  const response = await axios.get('https://api.deezer.com/search', {
    params: {
      q: trackDetails,
    },
  });
  if (response.data.data.length > 0) {
    return `https://www.deezer.com/track/${response.data.data[0].id}`;
  }
  return '';
}

function getService(url) {
  return new URL(url).hostname.replace('www.', '').split('.')[0].toLowerCase();
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
};