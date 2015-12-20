var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = mongoose.model('User', {
	player: ObjectId,
	uuid: String,
	password: String,
	banned: Boolean
}, 'users');