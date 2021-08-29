const sqlite = require('sqlite3')

const database = new sqlite.Database("database.db")

database.run(`CREATE TABLE IF NOT EXISTS songs(
	id INTEGER PRIMARY KEY,
	name TEXT,
    artist TEXT ,
    songLength TEXT
)`)



exports.getAllSongs = function(callback){


	const query = "SELECT * FROM songs ORDER BY id"
	const values = []

	database.all(query, values, function(error, songs){
		if(error){
			callback("Database error.")
		}else{
			callback(null, songs)
		}
	})
	
}



exports.getSongsFromPlaylist = function(id, callback){
	
	const query = "SELECT S.* FROM songs S INNER JOIN refference R on S.id = R.songID WHERE R.playlistID = ? "
	const values = [id]
	
	database.all(query, values, function(error, songs){
		
		if(error){
			callback("Database error.")
		}else{
			callback(null, songs)
		}
		
	})
}

exports.getSongsFromAllPlaylist = function(id, callback){
	
	const query = "SELECT S.* FROM songs S INNER JOIN refference R on S.id = R.songID INNER JOIN playlists P on P.id = R.playlistID AND P.owner_id = ?  "
	const values = [id]
	
	database.all(query, values, function(error, songs){
		
		if(error){
			callback("Database error.")
		}else{
			callback(null, songs)
		}
		
	})
}


exports.getSongsFromAllPlaylistPublic = function(id, callback){
	
	const query = "SELECT S.* FROM songs S INNER JOIN refference R on S.id = R.songID INNER JOIN playlists P on P.id = R.playlistID AND P.ownerID = ?  AND P.ispublic = 1"
	const values = [id]
	
	database.all(query, values, function(error, songs){
		
		if(error){
			callback("Database error.")
		}else{
			callback(null, songs)
		}
		
	})
}


exports.addSongToPlaylist = function(playlistID, songID ,  callback){

	
	
	var query = "INSERT INTO refference (playlistID , songID) VALUES (?, ?);  "
	var values = [playlistID, songID ]
	
	
	database.run(query, values, function(error){
		
		if(error){
			if (error.errno === 19 ) {
				callback("Cannot have the same song 2 times in your playlist")
			}
			else {
				callback("Database Error")
			}
		}else{
			callback(null, this.lastID)
		}
		
	})
	
}

exports.deleteSongById = function(songID, playlistID, callback){
	
	const query = "DELETE FROM refference WHERE songID = ? AND playlistID = ?"
	const values = [songID , playlistID]
	
	database.run(query, values, function(error){
		
		if(error){
			callback("Database error.")
		}else{
			callback(null)
		}
		
	})
	
}
