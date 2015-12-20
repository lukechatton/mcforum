var mongoose = require('mongoose');

var mcUtils = require('./mcUtils')

var User = mongoose.model('User');
var Player = mongoose.model('Player');

var Topic = mongoose.model('Topic');
var Post = mongoose.model('Post');
var Category = mongoose.model('Category');

var async = require('async');

var regularCategories = ['General', 'Off Topic', 'Introduce Yourself', 'Media Spotlight', 'Map Submissions'];
var adminCategories = ['Announcements']

exports.getMostRecentPosts = function(viewingUser, categoryId, page, done) {
	var start = 0;
	var limit = 20;

	if(page > 1) {
		start = (20 * page) - 20;
	}


	var query = {};
	if(categoryId) {
		query = {'category': categoryId}
	}

	Topic
		.find(query)
		.sort({lastPostDate: -1})
		.skip(start)
		.limit(limit)
		.exec(function(err, topics) {
			if(err) {
				console.log(err);
			}

			var list = new Array();

			async.eachSeries(topics, function(topic, outerCallback) {
				if(!topic.deleted) {

					Player.findById(topic.user, function(err, player) {
						mcUtils.getUserFromUUID(player.uuid, function(user) {

							topic.user = user;
							topic.user.player = player;

							var fullPosts = new Array();
							async.eachSeries(topic.posts, function(post, innerCallback) {
								if(post) {
									getFullPost(viewingUser, post, function(fullPost) {
										if(fullPost) {
											fullPosts.push(fullPost);
										}
										innerCallback();
									})
								} else {
									innerCallback();
								}
							}, function(err) {
								topic.posts = fullPosts;

								topic.lastPostedAgo = fullPosts[fullPosts.length - 1].lastPostDate;
								topic.startedAgo = fullPosts[0].postedAgo;

								topic.user = user;
								topic.user.player = player;

								Category.findById(topic.category, function(err, category) {
									topic.category = category;
									topic.category.name = category.name;
									topic.category._id = category._id;
									list.push(topic);
									outerCallback();
								})
							})
						})
					})
				} else {
					outerCallback();
				}
			}, function(err) {
				Topic.count({}, function(err, count) {
					var numberOfPages = Math.floor(count / 20) + 1;
					return done(list, numberOfPages);
				})
			})
		})
}

exports.getFullPost = function(viewUser, postId, done) {
	Post.findById(postId, function(err, post) {
		Player.findById(post.user, function(err, player) {
			if(err) {
				console.log(err);
			}

			mcUtils.getUserFromUUID(player.uuid, function(user) {

				var fullPost = post;
				fullPost.user = user;
				fullPost.user.player = player;

				//posted date
				var now = new Date();
				var timeDiff = Math.abs(now.getTime() - fullPost.date.getTime());

				var postedAgo = '';
				var postedAgoNumber;

				var diffMinutes = Math.round(((timeDiff % 86400000) % 3600000) / 60000); //minutes
				var diffDays = Math.round(timeDiff / 86400000); // days
				var diffHours = Math.round((timeDiff % 86400000) / 3600000); // hours
				
				if(diffMinutes == 0 && diffHours == 0) {
					postedAgo = ' seconds ago';
				}
				else if(diffMinutes < 60 && diffHours == 0) {
					postedAgoNumber = diffMinutes;
					postedAgo = postedAgoNumber + ' minutes ago'
				} else {
					if(diffHours < 24 && diffDays == 0) {
						postedAgoNumber = diffHours;
						postedAgo = postedAgoNumber + ' hours ago';
					} else {
						postedAgoNumber = diffDays;
						postedAgo = postedAgoNumber + ' days ago';
					}
				}

				if(postedAgoNumber == 1) {
					postedAgo.replace('s', '');
				}

				fullPost.postedAgo = postedAgo;

				if(viewUser && post.deleted) {
					mcUtils.isMod(viewUser.player.rank, function(isMod) {
						if(isMod) {
							done(fullPost);
						} else {
							done(null);
						}
						// done(fullPost);
					})
				} else {
					done(fullPost);
				}
			})
		})
	})
}

getFullPost = function(viewUser, postId, done) {
	Post.findById(postId, function(err, post) {
		Player.findById(post.user, function(err, player) {
			if(err) {
				console.log(err);
			}

			mcUtils.getUserFromUUID(player.uuid, function(user) {

				var fullPost = post;
				fullPost.user = user;
				fullPost.user.player = player;

				//posted date
				var now = new Date();
				var timeDiff = Math.abs(now.getTime() - fullPost.date.getTime());

				var postedAgo = '';
				var postedAgoNumber;

				var diffMinutes = Math.round(((timeDiff % 86400000) % 3600000) / 60000); //minutes
				var diffDays = Math.round(timeDiff / 86400000); // days
				var diffHours = Math.round((timeDiff % 86400000) / 3600000); // hours
				
				if(diffMinutes == 0 && diffHours == 0) {
					postedAgo = ' seconds ago';
				}
				else if(diffMinutes < 60 && diffHours == 0) {
					postedAgoNumber = diffMinutes;
					postedAgo = postedAgoNumber + ' minutes ago'
				} else {
					if(diffHours < 24 && diffDays == 0) {
						postedAgoNumber = diffHours;
						postedAgo = postedAgoNumber + ' hours ago';
					} else {
						postedAgoNumber = diffDays;
						postedAgo = postedAgoNumber + ' days ago';
					}
				}

				if(postedAgoNumber == 1) {
					postedAgo.replace('s', '');
				}

				fullPost.postedAgo = postedAgo;

				if(viewUser && post.deleted) {
					mcUtils.isMod(viewUser.player.rank, function(isMod) {
						if(isMod) {
							done(fullPost);
						} else {
							done(null);
						}
						// done(fullPost);
					})
				} else {
					done(fullPost);
				}
			})
		})
	})
}

exports.canPostInCategory = function(user, category, done) {
	if(user) {
		if(user.rank.toLowerCase() == 'admin') {
			if(adminCategories.indexOf(category) >= 0 || regularCategories.indexOf(category) >= 0) {
				return done(true);
			}
		} else {
			if(regularCategories.indexOf(category) >= 0) {
				return done(true)
			}
		}
	}
	return done(false);
}