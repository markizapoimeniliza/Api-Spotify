



// 'use stric' in ES6 by default evrywhere



//client to server
//server to server
//token is given for the SESSION !
//we need to send the token ALL THE TIME

//require a node
// const cors = require('cors')

//redirect URI (ORCID WILL GIVE US IT) - TO MAKE A TOKEN ACTIVE MANY TIMES in OAuth  !!!!!!
   //white-listed sites to be redirected after failure/success
//irl ONLY HTTPS

const ApiController = (() => {

    const Client_Id = '';
    const Client_Secret = '';


    //API MODULE
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
              //* only w/o credentials
                //CORS WILL SEND US IT BACK
                // 'Access-Control-Allow-Methods': 'GET, POST,PUT, DELETE, OPTIONS',
                // 'Access-Control-Allow-Max-Age': '1000',
                // 'Access-Control-Allow-Headers': 'x-requested-with, Content-Type, origin, Authorization, accept, x-access-token,Access-Control-Allow-Headers',
                // 'Acess-Control-Allow-Origin': '*',
                // 'Origin': '*',

            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                 //BTOA() CONVERTS A STRING TO BASE-64
                //SEND TO A RESOURCE OWNER 
                 //GET CLIENT CREDENTIALS AND SEND THEM TO A SERVER; IT WILL GET US A TOKEN AND WE CAN ACCESS EVERYTHING THROUGH TOKEN
                'Authorization' : 'Basic ' + btoa(Client_Id + ':' + Client_Secret) 
                },
                body: 'grant_type=client_credentials'
        });
       const data = await result.json();
       return data.access_token;
    }

    //implicit grant
    const _getGenres = async (token) => {
        const response = await fetch('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const result = await response.json();
        return result.categories.items;
    }

    const _getPlaylistByGenre = async (token, categoryId) => {

        const limit = 10;

        const response = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        });

        const result =  await response.json();
        return result.playlists.items;
    }

    const _getTracks = async (token,tracksEndPoint) => {

        const limit = 7;

        //as we alreay have a data set WE CAN RETURN
        const response = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const result = await response.json();
        return result.items;
    }

    const  _getTrack = async(token,trackId) => {
        
        //WE ALREADY HAVE RETRIEVED A DATA SET
        const response = await fetch(`${trackId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const result = await  response.json()
        return result;
    }


    //TOGETHER ALL METHODS !!!FOR PRIVACY
    return {
        getToken(){
            return _getToken();
        },
        getGenres(token){
            //parameters will pass
            return _getGenres(token);
        },
        getPlaylist(token,categoryId){
            return _getPlaylistByGenre(token,categoryId);
        },
        getTracks(token,tracksEndPoint){
            return _getTracks(token,tracksEndPoint);
        },
        getTrack(token,trackId){
            return _getTrack(token,trackId);
        }
    }

})();

// //converts js to json
// ApiController.then(response => response.json())
// .then(({received}) => received.forEach((received,index)=>{
//     console.log(`Beat ${index} starts at ${received.start}`)
// }))


//UI module

const ui_controller = (() => {

    //reference to HTML selectors
    //the way to save the data
    const DOMelements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        btnSubmit: '#btn',
        //song_details BELOW EVERYTHING
        //songDetails = divSongDetail
        songDetails: '#song_details',
        //songCover = divSongList
        songCover: '#song_cover',
        hfToken: '#hidden_token'
    }


    //public methods
    return {

        //return to save an output later
        inputField(){

            //without name binding RETRUN AN OBJECT
            return{
                genre: document.querySelector(DOMelements.selectGenre), 
                playlist: document.querySelector(DOMelements.selectPlaylist),
                cover:  document.querySelector(DOMelements.songCover), //tracks
                btn: document.querySelector(DOMelements.btnSubmit), 
                song: document.querySelector(DOMelements.songDetails), //songDetail
                // token: document.querySelector(DOMelements.hiddenToken)
            }
        },

        //create + reset everything

        //AUTOMTICALLY
        createGenre(text,value){
            //value will be sent to a server
            const genreName = `<option value = '${value}'>${text}</option>`;
            //ADJACENT inserts a node into a DOM tree
            document.querySelector(DOMelements.selectGenre).insertAdjacentHTML('beforeend', genreName)
        },

        createPlaylist(text,value){
            const playlist = `<option value = '${value}'> ${text} </option>`
            document.querySelector(DOMelements.selectPlaylist).insertAdjacentHTML('beforeend', playlist)
        },

        //track
        createSongDetails(id,name){
            //list-group item (style)= BOOTSTRAP
            const infoSong = `<a href = "#" class = "list-group-item list-group-item-action list-group-item-light" style = 'color: rgb(129, 115, 68)' id = "${id}" >${name}</a>`;
            document.querySelector(DOMelements.songCover).insertAdjacentHTML('beforeend', infoSong)
        },
        // UIctlr.createTrackCover(responseFromApi.album.images[1],responseFromApi.altText,responseFromApi.name,responseFromApi.artists[0].name)
        createTrackCover(value,title,artist){
            const details = document.querySelector(DOMelements.songDetails);
            details.innerHTML = '';

            const track = `
            <div>
              <img src = "${value}" alt ="" style = 'left-margin: 22vmin; width: 26vmin'>
            </div>
            <br>
            <div>
              <label for = "Genre">Title: ${title}</label>
            </div>
            <div>
              <label for = "artist">Artist: ${artist}</label>
            </div>
            `;
            //as the last descendent
            details.insertAdjacentHTML('beforeend',track)
            

        },

        

        resetSongDetails(){
            this.inputField().song.innerHTML = '';
            
        },

        resetTrack(){
            //this (method METHOD in  ONE CLASS)
            this.inputField().cover.innerHTML = '';
            this.resetSongDetails();
        },
        
        resetPlaylist(){
            this.inputField().playlist.innerHTML = '';
            this.resetTrack();
        },



        //WE CANNOT RESET GENRES  
        // resetGenre(){
        //     this.inputField().genre.innerHTML = ''
        //     this.resetSongDetails()
        // },

        //SEPARATED FOR ENCAPSULATION
        createAndStoreToken(value){
            document.querySelector(DOMelements.hfToken).value = value;
        },
        
        getToken(){
            return {
                token: document.querySelector(DOMelements.hfToken).value
            }
        }

    }
})();


//App module
const app_controller = ((APIctlr,UIctlr) => {

    //get a reference
    const DOMinputs = UIctlr.inputField();

    const loadGenres = async() => {

        const tokenFromApi = await APIctlr.getToken();

        UIctlr.createAndStoreToken(tokenFromApi);

        const getGenresApi = await APIctlr.getGenres(tokenFromApi);
        getGenresApi.forEach(element =>  UIctlr.createGenre(element.name, element.id));
            //name - reference FOR server
           
        

    }

   //change - for inouts textareas selects
   DOMinputs.genre.addEventListener('change', async () => {
    // e.preventDefault() - NOT NECCESARY HERE
    UIctlr.resetPlaylist();
    const token  = UIctlr.getToken().token;
    const genreSelect = DOMinputs.genre;
    //assiciate with a selected node
    const genreId = genreSelect.options[genreSelect.selectedIndex].value;
    // const genreName = genreSelect.name
    const responseFromApi = await APIctlr.getPlaylist(token,genreId);
    // ONLY FOR ARRAYS!
    responseFromApi.forEach(type => UIctlr.createPlaylist(type.name,type.tracks.href));
})

//+submit +choose a song

   DOMinputs.btn.addEventListener('click', async(e) =>{
    //prevent from window.reload()
    e.preventDefault();
    //search for a new song
    UIctlr.resetTrack();
    const token = UIctlr.getToken().token;
    //WE GO TO EXISTING PLAYLIST!
    const playlist = UIctlr.inputField().playlist;

    const track = playlist.options[playlist.selectedIndex].value;

    const responseFromApi = await APIctlr.getTracks(token, track);

        //IT WILL BE BY DEFAULT
        //NAME - note to sth ID - content ITSELF !!!
        //RETRIEVE THIS CONTENT
    responseFromApi.forEach(t => UIctlr.createSongDetails(t.track.href,t.track.name) )//name - REDIRECT TO A SERVER 
   })
    

   //e - event target - element that triggered the event!
    DOMinputs.cover.addEventListener('click', async (e) => {
    e.preventDefault();
    UIctlr.resetSongDetails();
    const token = UIctlr.getToken().token;
    //event Delegation (target - any inside a parent)
    const trackId = e.target.id;
    const track = await APIctlr.getTrack(token, trackId);
    //id for content INSIDE not images
    UIctlr.createTrackCover(track.album.images[2].url, track.name, track.artists[0].name);
    //through website (ON SPOTIFY)
   });
//to save to app_controller
return {
    start(){
    console.log('start');
    loadGenres();
    }
}

//specific parameters
})(ApiController,ui_controller);


app_controller.start();




//IIFE FOR PRIVACY


//GUI + THEORY = MONDAY + TUESDAY
