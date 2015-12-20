var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/forum/user');
var bCrypt = require('bcrypt-nodejs');

var mongoose = require('mongoose');

var Player = mongoose.model('Player');
var User = mongoose.model('User');

var mcUtils = require('../util/mcUtils');

module.exports = function(passport){

	passport.use('local', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) {
			mcUtils.getUserFromName(username, function(user) {
				if(user) {
					if(!isValidPassword(user, password)) {
						console.log('invalid password for ' + username);
						return done(null, false, req.flash('login', 'Wrong password'));
					}

					return done(null, user);
				} else {
					done(null, false, req.flash('login', 'Account not found'));
				}
			})
		})
	);
	
	var isValidPassword = function(user, password){
		console.log('user password: ' + user.player.password)
		return password && password == user.player.password;
	}
}