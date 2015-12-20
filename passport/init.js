var login = require('./login');
var Player = require('../models/mc/player');

var mcUtils = require('../util/mcUtils');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ' + user.player.name);
        done(null, user.player._id);
    });

    passport.deserializeUser(function(id, done) {
        Player.findById(id, function(err, player) {
            console.log('deserializing user: ' + player.name);

            mcUtils.getUserFromName(player.name, function(user) {
                done(err, user);
            })
        });
    });

    login(passport);
}