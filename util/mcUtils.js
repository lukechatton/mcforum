// var Player = require('../models/mc/player');
// var WarzonePlayer = require('../models/mc/warzone');
// var InfectedPlayer = require('../models/mc/infected');

var mongoose = require('mongoose');

var Player = mongoose.model('Player');
var WarzonePlayer = mongoose.model('Warzone');
var InfectedPlayer = mongoose.model('Infected');


var Punish = mongoose.model('Punish');
var User = require('../models/mc/User');

var async = require('async');


//returns user
exports.getUserFromName = function(name, done) {
	var regex = new RegExp(["^", name, "$"].join(""), "i");

	Player.findOne({'name': regex}, function(err, player) {
		if(err) {
			console.log('mcUtils.getUserFromName error: ' + err);
			return done(null);
		}
		if(player) {
			WarzonePlayer.findOne({'uuid': player.uuid}, function(err, warzonePlayer) {
				InfectedPlayer.findOne({'uuid': player.uuid}, function(err, infectedPlayer) {
					var user = new User(player, warzonePlayer, infectedPlayer);
					done(user);
				})
			});
		} else {
			done(null);
		}
	})
}

//returns user
getUserFromUUID = function(uuid, done) {
	Player.findOne({'uuid': uuid}, function(err, player) {
		if(player) {
			WarzonePlayer.findOne({'uuid': player.uuid}, function(err, warzonePlayer) {
				InfectedPlayer.findOne({'uuid': player.uuid}, function(err, infectedPlayer) {
					var user = new User(player, warzonePlayer, infectedPlayer);
					done(user);
				})
			});
		} else {
			done(null);
		}
	})
}

//returns user
exports.getUserFromUUID = function(uuid, done) {
	Player.findOne({'uuid': uuid}, function(err, player) {
		if(player) {
			WarzonePlayer.findOne({'uuid': player.uuid}, function(err, warzonePlayer) {
				InfectedPlayer.findOne({'uuid': player.uuid}, function(err, infectedPlayer) {
					var user = new User(player, warzonePlayer, infectedPlayer);
					done(user);
				})
			});
		} else {
			done(null);
		}
	})
}

//returns user
getUserFromObjectID = function(id, done) {
	Player.findOne({'_id': id}, function(err, player) {
		if(player) {
			WarzonePlayer.findOne({'uuid': player.uuid}, function(err, warzonePlayer) {
				InfectedPlayer.findOne({'uuid': player.uuid}, function(err, infectedPlayer) {
					var user = new User(player, warzonePlayer, infectedPlayer);
					done(user);
				})
			});
		} else {
			done(null);
		}
	})
}

//returns list of top warzone users
exports.getTopWarzone = function(field, done) {
	var self = this;
	WarzonePlayer
		.find({})
		.sort("-" + field)
		.limit(20)
		.exec(function(err, players) {
			if(err) {
				console.log(err);
			}

			var list = new Array();

			
			async.eachSeries(players, function(player, callback) {
				getUserFromUUID(player.uuid, function(user) {
					list.push(user);
					callback();
				})
			}, function(err) {

				if(field == 'kills') {
					list.sort(function(a,b) {return b.warzone.kills-a.warzone.kills})
				}

				else if(field == 'deaths') {
					list.sort(function(a,b) {return b.warzone.deaths-a.warzone.deaths})
				}

				else if(field == 'matches') {
					list.sort(function(a,b) {return b.warzone.matches-a.warzone.matches})
				}

				done(list);
			})
	})
}

//returns list of top warzone users
exports.getTopInfected = function(field, done) {
	var self = this;
	InfectedPlayer
		.find({})
		.sort("-" + field)
		.limit(20)
		.exec(function(err, players) {
			if(err) {
				console.log(err);
			}

			var list = new Array();

			
			async.eachSeries(players, function(player, callback) {
				getUserFromUUID(player.uuid, function(user) {
					list.push(user);
					callback();
				})
			}, function(err) {

				if(field == 'kills') {
					list.sort(function(a,b) {return b.infected.kills-a.infected.kills})
				}

				else if(field == 'deaths') {
					list.sort(function(a,b) {return b.infected.deaths-a.infected.deaths})
				}

				else if(field == 'matches') {
					list.sort(function(a,b) {return b.infected.matches-a.infected.matches})
				}

				done(list);
			})
	})
}

//returns list of top player (global stats) users
exports.getTopPlayer = function(field, done) {
	var self = this;
	Player
		.find({})
		.sort("-" + field)
		.limit(20)
		.exec(function(err, players) {
			if(err) {
				console.log(err);
			}

			var list = new Array();

			
			async.eachSeries(players, function(player, callback) {
				getUserFromUUID(player.uuid, function(user) {
					list.push(user);
					callback();
				})
			}, function(err) {

				if(field == 'xp') {
					list.sort(function(a,b) {return b.player.xp-a.player.xp})
				}

				else if(field == 'coins') {
					list.sort(function(a,b) {return b.player.coins-a.player.coins})
				}

				else if(field == 'tickets') {
					list.sort(function(a,b) {return b.player.tickets-a.player.tickets})
				}

				done(list);
			})
	})
}

exports.isMod = function(rank, done) {
	if(rank.toLowerCase() == 'mod' || rank.toLowerCase() == 'admin') {
		done(true);
	} else {
		done(false);
	}
}