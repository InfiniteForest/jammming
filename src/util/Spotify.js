let accessToken = '';
let expiresIn='';
const clientID = 'e79eb9474e6244748986b6b83db18d99';
const redirectURI = 'https://serious-color.surge.sh';


const Spotify = {
  getAccessToken() {
    if (accessToken !== '') {
      return accessToken;
    } else if (window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
      const URL = window.location.href;
      let tokenArray = URL.match(/access_token=([^&]*)/);
      accessToken = tokenArray[1];
      let expiresInArray = URL.match(/expires_in=([^&]*)/);
      expiresIn = expiresInArray[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },

  search(searchTerm) {
    this.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, {
      headers: {Authorization: `Bearer ${accessToken}`}
    })
    .then(response => {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Request failed!');
    },
      networkError => {
        console.log(networkError.message);
    })
    .then(jsonResponse => {
      if(jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        })
      } else {
        return [];
      }
    });
  },


  savePlaylist(playlistName, trackURIs) {
    if (playlistName === '' || !trackURIs.length ) {
      return;
    }

    const accessTokenVar = accessToken;
    const headers = {Authorization: `Bearer ${accessTokenVar}`};
    let userID;

    return getUserID()
    .then(userID => getPlaylistID(userID))
    .then(playlistID => createPlaylist(userID, playlistID));

    async function getUserID() {
      try {
        let response = await fetch('https://api.spotify.com/v1/me', {headers: headers});
        if (response.ok) {
          let jsonResponse = await response.json();
          userID = jsonResponse.id;
          return userID;
        }
        throw new Error('Request failed!');
      } catch (error) {
        console.log(error);
      }
    }


    async function getPlaylistID(userID) {
      try {
        let response = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({name: playlistName})
        });
        if (response.ok) {
          let jsonResponse = await response.json();
          return jsonResponse.id;
        }
        throw new Error('Request failed!');
      }
      catch(error) {
        console.log(error);
      }
    }


    async function createPlaylist(userID, playlistID) {
      try {
        let response = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackURIs})
        });
        if (response.ok) {
          let jsonResponse = await response.json();
          playlistID = jsonResponse.id;
          return playlistID;
        }
        throw new Error('Request failed!');
      }
      catch(error) {
        console.log(error);
      }
    }

  }
};

export default Spotify;
