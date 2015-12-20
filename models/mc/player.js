var mongoose = require('mongoose');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

module.exports = mongoose.model('Player', {
	uuid: String,
	name: String,
	rank: String,
	coins: Number,
	tickets: Number,
	join_date: String,
	last_online_date: String,
	xp: Number,
	password: String,
	posts: [ObjectId],
	topics: [ObjectId],
	websiteBan: Boolean
}, 'players');