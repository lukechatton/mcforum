var method = User.prototype;
var dateFormat = require('dateformat');

function User(player, warzone, infected) {
	this.player = player;
	this.warzone = warzone;
	this.infected = infected;

	this.last_online_formatted = dateFormat(this.player.last_online_date, "dddd, mmmm dS h:MM TT");
	this.first_joined_formatted = dateFormat(this.player.join_date, "mmmm dS, yyyy");

	this.level = Math.round((player.xp / 100));
}

method.player = this.player;
method.warzone = this.warzone;
method.infected = this.infected;

module.exports = User;