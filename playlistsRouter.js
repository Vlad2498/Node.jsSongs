const express = require('express')
const playlistsTable = require('./playlistsdb')
const songsTable = require("./songsdb")
const jsonwebtoken = require('jsonwebtoken')
const secret = "sdfjhdkjfhsdkjfhsk"

const router = express.Router()

function getPlaylistValidationErrors(name, picture){
	
	const errors = []
	
	if(name.length == 0){
		errors.push("Name may not be empty.")
	}
	
	if(picture.length == 0){
		errors.push("Must enter a picture.")
	}
	
	return errors
	
}






router.get("/", function(request, response){
	// if (!request.authorization){
	// 	response.send("Sugi pula")
	// }
	console.log(request.session.authorization)
	
	playlistsTable.getAllPlaylists(function(error, playlists){
		
		if(!request.session.isLoggedIn){		
			// response.send('Please login to view this page!');
			response.render('not_loggedin.hbs', { layout: "intro.hbs" })
		}
		else{
			const model = {
				playlists: playlists,
				playlistsError: error
			}
			response.render("home.hbs", model)
			
		}
		
	})
	
})




router.get("/create", function(request, response){
	if(!request.session.isLoggedIn){		
		// response.send('Please login to view this page!');
		response.render('not_loggedin.hbs', { layout: "intro.hbs" })

	}else
	response.render("create_playlist.hbs")
})

// function that does the authorization check
function authorize(token, owner_id) {
	try {
		const payload = jsonwebtoken.verify(token, secret)
		console.log("create playlist " + token)
		return payload.accountId === owner_id
	}
	catch(exception){
		console.log(exception)
		return false
	}
}


router.post("/create", function(request, response){
	
	const name = request.body.name
	const picture = request.body.picture
	const public = request.body.public
	const owner_id = request.body.owner_id
	
	if (!authorize(request.session.authorization, owner_id)) {
		response.status(401).json({ message: "User is not authorized" })
		return
	}

	const errors = getPlaylistValidationErrors(name, picture)
	
	if(errors.length == 0){
		
		playlistsTable.createPlaylist(name, picture , public , owner_id, function(error){
			if(error){
				// TODO: Handle error.
				response.send('The operation could not be completed.' + error);
			}else{
				response.redirect("/home")
			}
		})
		
	}else{
		
		const model = {
			errors: errors,
			name: name,
			picture : picture ,
			public : public ,
			owner_id:owner_id
		}
		
		response.render("create_playlist.hbs", model)
		
	}
	
})

router.get("/:id", function(request, response){
	if(!request.session.isLoggedIn){		
		// response.send('Please login to view this page!');
		response.render('not_loggedin.hbs', { layout: "intro.hbs" })

	}else
	{

	const id = request.params.id
	
	playlistsTable.getPlaylistById(id, function(playlistsError, playlist){
				songsTable.getSongsFromPlaylist(id ,function(songsError,songs){
					const model = {
						playlist:playlist,
						songs: songs,
						playlistsErrorMessage: playlistsError,
						songsErrorMessage: songsError
					}
					response.render("playlist.hbs", model)

				})
		})	
	}
})


router.post("/delsong", function(request, response){
	
	const songID = request.body.songID
	const playlistID = request.body.playlistID

	const accountId = request.session.account ? request.session.account.id : null
	if (!authorize(request.session.authorization, accountId)) {
		response.status(401).json({ message: "User is not authorized" })
		return
	}
	
	songsTable.deleteSongById(songID, playlistID ,function(deleteSongError){
		if(deleteSongError){
			response.send('Internal server error, try again later!' + deleteSongError);
		}
		else {
			playlistsTable.getPlaylistById(playlistID, function(playlistsError, playlist){
				if (playlistsError){
					response.send('Internal server error, try again later!' + playlistsError);
				}
				else {
						songsTable.getSongsFromPlaylist(playlistID ,function(songsError,songs){
							if (playlistsError){
								response.send('Internal server error, try again later!' + songsError);
							}
							else {
								const model = {
									playlist:playlist,
									songs: songs,
									errorMessage: songsError
								}
								response.render("playlist.hbs", model)
							}
						})
					}
				})
			}	
	})
	
})



router.post("/:id", function(request, response){
	
	const id = request.params.id
	
	playlistsTable.deletePlaylistById(id, function(error){
		
		if(error){
			response.send('Internal server error, try again later!' + error);
		}else{
			response.redirect("/home")
		}
		
	})
	
})




module.exports = router