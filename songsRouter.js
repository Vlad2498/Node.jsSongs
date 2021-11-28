const express = require('express')
const songsTable = require('./songsdb')
const playlistsTable = require('./playlistsdb')

const jsonwebtoken = require('jsonwebtoken')
const secret = "sdfjhdkjfhsdkjfhsk"

const router = express.Router()

// function that does the authorization check
function authorize(token, owner_id) {
	try {
		const payload = jsonwebtoken.verify(token, secret)
		console.log("songs router " + token)
		return payload.accountId === owner_id
	}
	catch(exception){
		console.log(exception)
		return false
	}
}

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

	const accountId = request.session.account ? request.session.account.id : null

	if (!authorize(request.session.authorization, accountId)) {
		response.status(401).json({ message: "User is not authorized" })
		return
	}
	console.log(request.session.account.id)

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