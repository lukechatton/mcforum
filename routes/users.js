var express = require('express');
var router = express.Router();
var query = require('../util/mcUtils');

var mongoose = require('mongoose');
var Player = mongoose.model('Player');


module.exports = function(passport){

	/* GET users listing. */
	router.get('/:user_name', function(req, res, next) {

		query.getUserFromName(req.params.user_name, function(mcUser) {
			if(mcUser) {
				res.render('user', {
					title: mcUser.player.name + ' Profile',
					mcUser: mcUser,
					user: req.user
				})
			} else {
				res.render('playerNotFound', {
					title: 'Player Not Found',
					user: req.user
				});
			}
		})

	});

	/* GET users listing. */
	router.get('/:user_name/edit', function(req, res, next) {

		query.getUserFromName(req.params.user_name, function(mcUser) {
			if(mcUser) {
				if(req.user && req.user.player.uuid.toString() == mcUser.player.uuid.toString()) {
					res.render('edituser', {
						title: mcUser.player.name + ' Profile',
						mcUser: mcUser,
						user: req.user
					})
				} else {
					res.render('user', {
						title: mcUser.player.name + ' Profile',
						mcUser: mcUser,
						user: req.user
					})
				}
			} else {
				res.render('playerNotFound', {
					title: 'Player Not Found',
					user: req.user
				});
			}
		})

	});

	/* post password change */
	router.post('/:user_name/setpassword', isAuthenticated, function(req, res) {
		if(!req.user) {
			return res.redirect('/login');
		}

		if(req.body.password) {
			console.log('found new password: ' + req.body.password)

			query.getUserFromName(req.params.user_name, function(user) {
				if(user) {
					if(user.player.uuid.toString() == req.user.player.uuid.toString()) {
						Player.update({_id: user.player._id}, {$set: {password: req.body.password}}, function(err) {
							if(err) {
								console.log(err);
							}

							console.log('changed password for user ' + req.user.player.name);
							return res.redirect('/u/' + req.params.user_name);
						})
					} else {
						return res.redirect('/home')
					}
				} else {
					return res.redirect('/u/' + req.params.user_name);
				}
			})

		} else {
			return res.redirect('/u/' + req.params.user_name);
		}
	})

	router.get('/', function(req, res, next) {
		res.render('playerNotFound', {
			title: 'Player Not Found',
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
