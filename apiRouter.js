const express = require('express')
const bcrypt = require('bcrypt')

const db = require('./usersdb')
const playlists = require('./playlistsdb')

const songs = require("./songsdb")
const jsonwebtoken = require('jsonwebtoken')

const router = express.Router()
const secret = "sdfjhdkjfhsdkjfhsk"


// Login (create the token)
router.post("/token", function (request, response) {
	const username = request.body.username
	const password = request.body.password

	db.getAccountByUsername(username, function (error, account) {
		if (0 < error.length) {
			response.status(500).end()
		} else if (!account) {
			response.status(400).json({
				"error": "Account does not exist"
			})
		} else {
			bcrypt.compare(password, account.password, function (err, res) {
				if (res == false) {
					response.status(400).json({
						error: "Wrong username or password"
					})
				}
				else {
					//CREATE AND SEND BACK TOKEN (Bearer type)
					const accessToken = jsonwebtoken.sign({ accountId: account.id }, secret)
					const idToken = jsonwebtoken.sign({ sub: account.id, preferred_username: account.name }, secret)
					response.status(200).json({
						access_token: accessToken,
						token_type: "Bearer",
						id_token: idToken
					})
				}
			})
		}
	})
})

function getValidationErrors(name, picture) {

	const errors = []

	if (name.length == 0) {
		errors.push("Name may not be empty.")
	}

	if (picture.length == 0) {
		errors.push("Must enter a picture.")
	}

	return errors

}

function getValidationErrors2() {

	const errors = []



	return errors

}

//Create playlist (Need Token)
router.post("/playlist", function (request, response) {
	const owner_id = request.body.owner_id // playlist owner
	const name = request.body.name // playlist name
	const public = request.body.public // is public playlist ?
	const picture = request.body.picture //playlist picture

	try {
		const authorizationHeader = request.header("authorization") // "Bearer XXX"
		if (!authorizationHeader) { throw 'Token missing' }
		const accessToken = authorizationHeader.substring("Bearer ".length)
		if (!accessToken) { throw 'Invalid Token' }
		const payload = jsonwebtoken.verify(accessToken, secret)
		if (!payload) { throw 'Invalid Token' }
		const accountId = payload.sub
		// console.log("owner recieved is ", owner_id, " account id from api is ", accountId)
		if (owner_id != accountId) { throw "bad user" }

		playlists.createPlaylist(name, picture, public, owner_id, function (error) {
			if (error) {
				response.status(500).json({ "error": error })
			} else {
				response.status(200).json({ "status": 200, "action": "playlist created" })
			}
		})
	} catch (error) {
		console.log(error)
		response.status(400).json({ error })
	}
})

//Add song to playlist (Need Token)
router.post("/playlistsong", function (request, response) {
	const songID = request.body.songId
	const playlistID = request.body.playlistId
	const errors = getValidationErrors2()
	let gooduser = false
	if (errors.length == 0) {
		try {
			const authorizationHeader = request.header("authorization") // "Bearer XXX"
			if (!authorizationHeader) { throw 'Token missing' }
			const accessToken = authorizationHeader.substring("Bearer ".length)
			if (!accessToken) { throw 'Invalid Token' }
			const payload = jsonwebtoken.verify(accessToken, secret)
			if (!payload) { throw 'Invalid Token' }
			const accountId = payload.sub
			console.log(accountId)
			//if (owner_id != accountId) { throw "bad user" }
			playlists.getPlaylistsByOwnerId(accountId, function (error, playlists) {
				if (!error) {
					playlists.forEach(element => {
						// console.log(element.id, " <element id | owner id> ", element.ownerID, " playlist id from header:", playlistID, " accountid from payload:", accountId)
						if (element.id == playlistID && element.ownerID == accountId) {
							gooduser = true
							songs.addSongToPlaylist(playlistID, songID, function (error) {
								if (error) {
									response.status(500).json({ error })
								} else {
									const model = {
										playlistID: playlistID,
										songID: songID
									}
									response.status(200).json({ "status":"Success" })
								}
							})
						}
					})
					if (!gooduser) {response.status(400).json({"error":"This user can't access this playlist"})}
				}
			})
		} catch (error) {
			console.log(error)
			response.status(400).json({ error })
		}
	} else {
		response.status(400).json({ errors })
	}
})

module.exports = router;