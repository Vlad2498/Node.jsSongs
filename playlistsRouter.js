const express = require('express')
const db = require('./playlistsdb')
const db1 = require("./songsdb")

const router = express.Router()

function getValidationErrors(name, picture){
	
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
	
	db.getAllPlaylists(function(error, playlists){
		
		if(!request.session.isLoggedIn){		
			// response.send('Please login to view this page!');
			response.render('not_loggedin.hbs', { layout: "intro.hbs" })
		}
		else{
			const model = {
				playlists: playlists
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



router.post("/create", function(request, response){
	
	const name = request.body.name
	const picture = request.body.picture
	const public = request.body.public
	const owner_id = request.body.owner_id
	
	const errors = getValidationErrors(name, picture)
	
	if(errors.length == 0){
		
		db.createPlaylist(name, picture , public , owner_id, function(error){
			if(error){
				// TODO: Handle error.
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
	
	db.getPlaylistById(id, function(error, playlist){
		
		if(error){
			// TODO: Handle error.
		}else
			{
				db1.getSongsFromPlaylist(id ,function(error,songs){
					const model = {
						playlist:playlist,
						songs: songs
					}
					response.render("playlist.hbs", model)

				})
			}
		})	
	}
})


router.post("/delsong", function(request, response){
	
	const songID = request.body.songID
	const playlistID = request.body.playlistID
	
	db1.deleteSongById(songID, playlistID ,function(error){
		
		if(error){
			// TODO: Handle error.
		}else{
			db.getPlaylistById(playlistID, function(error, playlist){
		
					
						db1.getSongsFromPlaylist(playlistID ,function(error,songs){
							const model = {
								playlist:playlist,
								songs: songs
							}
							response.render("playlist.hbs", model)
		
						})
					
				})	
		}
		
	})
	
})



router.post("/:id", function(request, response){
	
	const id = request.params.id
	
	db.deletePlaylistById(id, function(error){
		
		if(error){
			// TODO: Handle error.
		}else{
			response.redirect("/home")
		}
		
	})
	
})




module.exports = router