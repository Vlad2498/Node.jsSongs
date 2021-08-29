const express = require('express')
const songsTable = require('./songsdb')
const playlistsTable = require('./playlistsdb')

const router = express.Router()



router.get("/", function(request, response){
	
	songsTable.getAllSongs(function(error, songs){
		
		if(!request.session.isLoggedIn){		
			// response.send('Please login to view this page!');
			response.render('not_loggedin.hbs', { layout: "intro.hbs" })
			
		}else{
			playlistsTable.getAllPlaylistsByOwnerId(request.session.account.id , function(error,playlists){
				if(error){
					response.send(error);
				}else{		
					const model = {
						playlists : playlists ,
						songs: songs 				
					}
					response.render("songs.hbs", model)
				}
			})
		}
		
	})
	
})

router.post("/", function(request, response){
	if(!request.session.isLoggedIn){		
		// response.send('Please login to view this page!');
		response.render('not_loggedin.hbs', { layout: "intro.hbs" })
		
	}else{
		const songID = request.body.songId
		const playlistID = request.body.playlistId
		songsTable.addSongToPlaylist(playlistID , songID , function(error){
			if(error){
				response.send(error);
			}else{
				response.redirect("/songs")
			}
		})
	}
	
})


module.exports = router