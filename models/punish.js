var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Punish', {
	uuid: String,
	type: String,
	reason: String,
	length: Number,
	issued: String,
	expires: String,
	staff: String,
	reverted: Boolean,
	name: String,
	issuedDate: Date,
	expiresDate: Date,
	formatedTime: String
}, 'punish');