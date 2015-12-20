var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var McUser = require('../models/mc/McUser');
var mcUtils = require('../util/mcUtils');

var forumUtils = require('../util/forumUtils');

var Category = mongoose.model('Category');
var Topic = mongoose.model('Topic');
var Post = mongoose.model('Post');
var Player = mongoose.model('Player');

var User = require('../models/mc/User');

var async = require('async');

var markdown = require( "markdown" ).markdown;

recentPunishments = new Array();

module.exports = function(passport){

	//view forums index
	router.get('/', function(req, res) {

		var page = 1;

		if(req.query.page) {
			if(!isNaN(page)) {
				if(page <= 0) {
					page = 1;
				} else {
					page = req.query.page;
				}
			}
		}

		forumUtils.getMostRecentPosts(req.user, null, page, function(list, numberOfPages) {
			res.render('forum/forum-index', {
				title: 'MCWar.us Forums',
				user: req.user,
				topics: list,
				page: page,
				numberOfPages: numberOfPages,
				category: null
			});	
		})

	});

	//view forums index for category
	router.get('/:category_id', function(req, res) {

		var page = 1;

		if(req.query.page) {
			if(!isNaN(page)) {
				if(page <= 0) {
					page = 1;
				} else {
					page = req.query.page;
				}
			}
		}

		Category.findById(req.params.category_id, function(err, category) {
			if(category) {
				var canCreateTopic = true;
				if(category.admin && !(req.user && req.user.player.rank.toLowerCase() == 'admin')) {
					canCreateTopic = false;
				}
				forumUtils.getMostRecentPosts(req.user, req.params.category_id, page, function(list, numberOfPages) {
					res.render('forum/forum-index', {
						title: 'MCWar.us Forums',
						user: req.user,
						topics: list,
						category: category,
						page: page,
						numberOfPages: numberOfPages,
						canCreateTopic: canCreateTopic
					});	
				})
			} else {
				console.log('couldnt find category: ' + req.params.category_id);
				res.render('/');
			}
		})
	});

	router.get('/:category_id/new', function(req, res) {
		if(!req.user) {
			return res.render('login')
		}
		if(req.user.player.websiteBan) {
			return res.render('/');
		}
		Category.findById(req.params.category_id, function(err, category) {
			if(category) {
				res.render('forum/forum-newtopic', {
					title: 'MCWar New Topic',
					user: req.user,
					category: category
				});
			}
		})
	})

	//create topic
	router.post('/:category_id/new', isAuthenticated, function(req, res) {
		if(!req.user) {
			return res.redirect('/login');
		}

		if(req.user.player.websiteBan) {
			return res.redirect('/');
		}

		if(req.body.title && req.body.content) {
			if(req.body.title.length > 0 && req.body.content.length > 0 && req.body.title.length < 50 && req.body.content.length < 10000) {
				var post = new Post();
				post.user = req.user.player._id;
				post.content = req.body.content;
				post.date = new Date();
				post.lastEdited = new Date();
				post.deleted = false;

				post.save(function(err) {
					if(err) {
						console.log(err);
					}

					var topic = new Topic();
					topic.user = req.user.player._id;
					topic.title = req.body.title;
					topic.posts = [post._id];
					topic.startedDate = new Date();
					topic.lastPostDate = new Date();
					topic.category = req.params.category_id;
					topic.deleted = false;
					topic.sticky = false;
					topic.locked = false;
					topic.views = 0;

					topic.save(function(err) {
						if(err) {
							console.log(err);
						}

						return res.redirect('/forums/topics/' + topic._id);
					})
				})
			} else {
				console.log('post too short');
				res.redirect('/forums/' + req.params.category_id +'/new')
			}
		} else {
			console.log('didnt contain required params')
			res.redirect('/forums/' + req.params.category_id +'/new')
		}

	})

	//create topic
	router.post('/topics/:topic_id/new', isAuthenticated, function(req, res) {
		if(!req.user) {
			return res.redirect('/login');
		}

		if(req.user.player.websiteBan) {
			return res.redirect('/');
		}

		Topic.findById(req.params.topic_id, function(err, topic) {
			if(req.body.content) {
				if(req.body.content.length > 0 && req.body.content.length < 10000) {
					var post = new Post();
					post.user = req.user.player._id;
					post.content = req.body.content;
					post.date = new Date();
					post.lastEdited = new Date();
					post.deleted = false;

					post.save(function(err) {
						if(err) {
							console.log(err);
						}

						Topic.update({_id: topic._id}, {$addToSet: {posts: [post._id]}}, function(err) {
							Topic.update({_id: topic._id}, {$set: {lastPostDate: new Date()}}, function(err) {
								console.log('successful post reply');
								res.redirect('/forums/topics/' + req.params.topic_id);
							})
						})
					})
				} else {
					console.log('post too short');
					res.redirect('/forums/topics/' + req.params.topic_id +'/new')
				}
			} else {
				console.log('didnt contain required params')
				res.redirect('/forums/topics/' + req.params.topic_id +'/new')
			}
		}) 
	})

	//reply
	router.get('/topics/:topic_name/new', function(req, res, next) {
		Topic.findById(req.params.topic_name, function(err, topic) {
			if(err) {
				console.log(err);
			}

			if(!req.user) {
				return res.render('login');
			}

			if(topic) {
				Player.findById(topic.user, function(err, player) {
					mcUtils.getUserFromName(player.name, function(user) {
						topic.user = user;
						topic.user.player = player;

						forumUtils.getFullPost(req.user, topic.posts[0], function(post) {
							topic.posts[0] = post;
							var posts = [post];

							mcUtils.isMod(req.user.player.rank, function(isMod) {
								var canDelete = false;
								if(isMod || topic.user._id == req.user._id) {
									canDelete = true; 
								}
								res.render('forum/forum-newpost.jade', {
									title: topic.title,
									user: req.user,
									topic: topic,
									posts: posts,
									canDelete: canDelete
								});
							})
						})
					})
				})
			}
		})
	})

	//delete post
	router.post('/posts/:post_id/delete', isAuthenticated, function(req, res) {
		if(req.user) {
			Post.findById(req.params.post_id, function(err, post) {
				if(post) {
					Player.findById(post.user, function(err, player) {
						mcUtils.getUserFromName(player.name, function(user) {
							var canDelete = false;
							mcUtils.isMod(req.user.player.rank, function(isMod) {
								if(isMod) {
									canDelete = true;
								} else if(req.user.player.uuid == player.uuid) {
									canDelete = true;
								}

								if(canDelete) {
									Post.update({_id: post._id}, {$set: {deleted: true}}, function(err) {
										console.log('deleted post by ' + player.name);
										return res.redirect('/forums');
									})
								} else {
									return res.redirect('/forums');
								}
							})
						})
					})
				} else {
					console.log('couldnt find post: ' + post._id);
				}
			})
		}
	})

	//delete topic
	router.post('/topics/:topic_name/delete', isAuthenticated, function(req, res) {
		if(req.user) {
			Topic.findById(req.params.topic_name, function(err, topic) {
				if(err) {
					console.log(err);
				}

				if(topic) {
					Player.findById(topic.user, function(err, player) {
						mcUtils.getUserFromName(player.name, function(user) {
							topic.user = user;
							topic.user.player = player;

							forumUtils.getFullPost(req.user, topic.posts[0], function(post) {
								topic.posts[0] = post;
								var posts = [post];

								mcUtils.isMod(req.user.player.rank, function(isMod) {
									if(isMod || topic.user._id == req.user._id) {
										Topic.update({_id: topic._id}, {$set: {deleted: true}}, function(err) {
											if(err) {
												console.log(err);
											}

											console.log('deleted topic by ' + topic.user.player.name);
										})

										// return res.redirect('/forums')
									}
								})
							})
						})
					})
				}
			})
		}

		res.redirect('/forums')
	})

	router.get('/posts/:post_id/edit', function(req, res, next) {
		if(!req.user) {
			return res.render('login');
		}

		Post.findById(req.params.post_id, function(err, post) {
			if(post) {
				forumUtils.getFullPost(req.user, post._id, function(fullPost) {
					if(fullPost.user.player.uuid == req.user.player.uuid) {
						// console.log('fullPost._id: ' + fullPost._id);
						var originalPost = fullPost;

						res.render('forum/forum-editpost', {
							title: 'MCWar | Editing Post',
							user: req.user,
							originalPost: originalPost,
							post: fullPost
						})

					} else {
						console.log(req.user.player.name + ' didnt have permission to edit');
						return res.render('/forums', {
							user: req.user
						})
					}
				})
			} else {
				return res.render('/forums', {

				});
			}
		})
	})

	//edit post
	router.post('/posts/:post_id/edit', isAuthenticated, function(req, res) {
		if(!req.user) {
			return res.redirect('/forums');
		}

		if(!req.body.content || !(req.body.content.length > 0)) {
			return res.redirect('/forums');
		}

		Post.findById(req.params.post_id, function(err, post) {
			if(post) {
				forumUtils.getFullPost(req.user, post._id, function(fullPost) {
					if(fullPost.user.player.uuid == req.user.player.uuid) {
						Post.update({_id: fullPost._id}, {$set: {content: req.body.content, lastEdited: new Date()}}, function(err) {
							if(err) {
								console.log(err);
							}

							res.redirect('/forums');

							console.log('successfully updated post by ' + fullPost.user.player.name);
						})
					} else {
						console.log(req.user.player.name + ' didnt have permission to edit');
						return res.redirect('/forums')
					}
				})
			} else {
				console.log('coudnt find post to edit [POST]')
				return res.redirect('/forums');
			}
		})
	})

	//view topic
	router.get('/topics/:topic_name', function(req, res, next) {
		var page = 1;

		if(req.query.page) {
			if(!isNaN(page)) {
				if(page <= 0) {
					page = 1;
				} else {
					page = req.query.page;
				}
			}
		}

		Topic.findById(req.params.topic_name, function(err, topic) {
			if(err) {
				console.log(err);
			}

			if(topic) {


				Player.findById(topic.user, function(err, player) {
					mcUtils.getUserFromName(player.name, function(user) {
						topic.user = user;
						topic.user.player = player;

						var posts = new Array();
						async.eachSeries(topic.posts, function(postId, callback) {

							console.log('post id: ' + postId);
							forumUtils.getFullPost(req.user, postId, function(post) {
								if(post) {
									if(post.deleted) {

									} else {
										posts.push(post);
									}
								}
								callback();
							})
						}, function(err) {
							var numberOfPages = Math.floor(posts.length / 20) + 1;

							if(page > numberOfPages) {
								page = numberOfPages;
							}

							var startIndex = (20 * page) - 20;
							var totalPosts = posts.length;

							var canDelete = false;
							if(req.user) {
								mcUtils.isMod(req.user.player.rank, function(isMod) {
									if(isMod) {
										canDelete = true;
									}
								})
							}

							else if(req.user && req.user.player.uuid == topic.user.player._id) {
								canDelete = true;
							}
							

							// console.log(markdown.toHTML(posts[0].content));
							topic.posts = posts;

							Topic.update({_id: topic._id}, {$inc: {views: 1}}, function(err) {
								topic.views = topic.views + 1;
								res.render('forum/forum-viewtopic', {
									title: topic.title,
									user: req.user,
									topic: topic,
									posts: posts,
									numberOfPages: numberOfPages,
									page: page,
									canDelete: canDelete,
									startIndex: startIndex,
									totalPosts: totalPosts
								})
							})
						})
					})
				})	
			}
		})
	})


	return router;
}

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/login');
}