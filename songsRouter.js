const express = require('express')
const db = require('./songsdb')
const db1 = require('./playlistsdb')

const router = express.Router()


function getValidationErrors(){
	
	const errors = []
	
	
	
	return errors
	
}

router.get("/", function(request, response){
	
	db.getAllSongs(function(error, songs){
		
		if(!request.session.isLoggedIn){		
			// response.send('Please login to view this page!');
			response.render('not_loggedin.hbs', { layout: "intro.hbs" })
			
		}else{
			db1.getAllPlaylistsByOwnerId(request.session.account.id , function(error,playlists){
					
			const model = {
				playlists : playlists ,
				songs: songs 				
			}
			response.render("songs.hbs", model)
			})
		}
		
	})
	
})

router.post("/", function(request, response){
	
	const songID = request.body.songId
	const playlistID = request.body.playlistId
	
	
	const errors = getValidationErrors()
	
	if(errors.length == 0){
		
		db.addSongToPlaylist(playlistID , songID , function(error){
			if(error){
				response.send(error);
			}else{
				response.redirect("/songs")
			}
		})
		
	}else{
		
		const model = {
			errors: errors
		}
		
		response.render("songs.hbs", model)
		
	}
	
})


module.exports = router