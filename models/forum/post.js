var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = mongoose.model('Post', {
	user: ObjectId,
	content: String,
	date: Date,
	lastEdited: Date,
	deleted: Boolean,

	
	postedAgo: String
}, 'posts');