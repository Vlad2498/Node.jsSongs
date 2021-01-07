const express = require('express')
const db = require('./usersdb')
const bcrypt = require('bcrypt')
const router = express.Router()


router.get("/", function (request, response) {
	const model = {
		username: "",
		errors: [],
		layout: 'intro.hbs'
	}
	response.render("login.hbs", model)
})


router.post("/login", function (request, response) {

	const username = request.body.username
	const password = request.body.password

	db.getAccountByUsername(username, function (errors, account) {
		if (account == null) {
			const model = {
				username: username,
				errors: ["The username & password combination does not exist or the fields are empty"],
				layout: "intro.hbs"
			}
			response.render("login.hbs", model)
		} else {
			// Compare given password hash value with the one in the DB
			bcrypt.compare(password, account.password, function (err, res) {
				if (res == false) {
					const model = {
						username: username,
						errors: ["Wrong username or password!"],
						layout: "intro.hbs"
					}
					response.render("login.hbs", model)
				} else {
					// Login was successful
					request.session.account = account
					request.session.isLoggedIn = true
					response.redirect("/home")

				}
			})
		}
	})
})

module.exports = router