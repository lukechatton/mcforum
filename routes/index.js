var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var Player = mongoose.model('Player');
var WarzonePlayer = mongoose.model('Warzone');
var Punish = mongoose.model('Punish');

var query = require('../util/mcUtils');

module.exports = function(passport){

	if(passport) {
		console.log('passport is good');
	}

	/* GET leaderboards page. */
	router.get('/top', function(req, res, next) {
		query.getTopWarzone('kills', function(topWarzoneKills) {
			query.getTopWarzone('deaths', function(topWarzoneDeaths) {
				query.getTopWarzone('matches', function(topWarzoneMatches) {
					query.getTopInfected('kills', function(topInfectedKills) {
						query.getTopInfected('deaths', function(topInfectedDeaths) {
							query.getTopInfected('matches', function(topInfectedMatches) {
								res.render('top', {
									title: 'Top MCWar Players',
									user: req.user,

									topInfectedKills: topInfectedKills,
									topInfectedDeaths: topInfectedDeaths,
									topInfectedMatches: topInfectedMatches, 

									topWarzoneKills: topWarzoneKills,
									topWarzoneDeaths: topWarzoneDeaths,
									topWarzoneMatches: topWarzoneMatches,

								})
							})
						})
					})
				})
			})
		})
	});

	router.get('/', function(req, res) {
		res.render('home', {
			title: 'MCWar.us Online',
			user: req.user
		});
	})

	router.get('/login', function(req, res) {
		res.render('login', {
			message: req.flash('login'),
			user: req.user
		});
	})

	return router;
}

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}
