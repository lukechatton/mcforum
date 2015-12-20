var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = mongoose.model('Topic', {
	user: ObjectId,
	title: String,
	posts: [ObjectId],
	startedDate: Date,
	lastPostDate: Date,
	category: ObjectId,
	deleted: Boolean,
	sticky: Boolean,
	locked: Boolean,
	views: Number,

	lastPostedAgo: String,
	startedAgo: String
}, 'topics');