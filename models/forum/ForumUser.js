var method = User.prototype;
var dateFormat = require('dateformat');

var McUser = require('../mc/McUser')
var User = require('../forum/user')

function User(user, mcuser) {
	this.user = user;
	this.mcuser = mcuser;
}

method.user = this.user;
method.mcuser = this.mcuser;

module.exports = User;