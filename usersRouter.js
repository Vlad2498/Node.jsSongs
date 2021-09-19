const express = require('express')
const usersTable = require('./usersdb')
const playlistsTable = require('./playlistsdb')
const songsTable = require('./songsdb')

const router = express.Router()



router.get("/", function(request, response){
	if(!request.session.isLoggedIn){		
		response.render("not_loggedin.hbs", {layout:"intro.hbs"})
	
	}else{
		usersTable.getAllUsers(function(error, users){
				const model = {
					users: users,
					errorMessage: error
				}
				response.render("users.hbs", model)
		})
	}
})





router.get("/:id", function(request, response){
	
	const id = request.params.id
	if(!request.session.isLoggedIn){		
		response.render("not_loggedin.hbs", {layout:"intro.hbs"})
	
	}else{
		usersTable.getUserById(id, function(usersError, user){
				playlistsTable.getPlaylistsByOwnerId(id,function(playlistsError,playlists){
					songsTable.getSongsFromAllPlaylistPublic(id,function(songsError,songs){
						const model = {
							user:user ,
							playlists:playlists,
							songs:songs,
							songsErrorMessage: songsError,
							playlistsErrorMessage: playlistsError,
							usersErrorMessage: usersError
						}
						
						response.render("user.hbs", model)
					})
				})		
		})
	}	
})


module.exports = router
