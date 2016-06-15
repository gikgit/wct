Fiber = Npm.require('fibers');
/*****************************************************************************/
/* Publish Functions */
/*****************************************************************************/
Meteor.publish('comments', function () {
  return Comments.find({}, {sort: {timestamp: 1}});
});

Meteor.publish('users', function () {
  return Meteor.users.find({}, {fields: {profile: 1}});
});

Meteor.publish('rooms', function () {
  return Rooms.find({}, {sort: {name: 1}});
});

Meteor.publish('tweets', function () {
  return Tweets.find({});
});
/*****************************************************************************/
/* Accounts */
/*****************************************************************************/
Accounts.onCreateUser(function (options, user) {
  var fb_user = {};
  options.profile.name = user.services.facebook.name;
  options.profile.email = user.services.facebook.email;
  if (options.profile) {
        options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=small";
        fb_user.profile = options.profile;
  }
  return fb_user;
});

/*****************************************************************************/
/* Security */
/*****************************************************************************/
Comments.allow({
  insert: function (userId, doc) {
    return !!userId;
  },

  update: function (userId, doc) {
    return false;
  },

  remove: function (userId, doc) {
    return false;
  }
});

Rooms.allow({
  insert: function (userId, doc) {
    return !!userId;
  },

  update: function (userId, doc) {
    return false;
  },

  remove: function (userId, doc) {
    return false;
  }
});

/*****************************************************************************/
/* Database Seeding */
/*****************************************************************************/
if (!Rooms.findOne({name: 'greeting'})) {
  Rooms.insert({name: 'greeting'});
}

Twit = new TwitMaker({
  consumer_key:'0GhQDs3VxlXktYaoc4mFD1Gpa',
  consumer_secret:'XduJksDuqjIeXAv4LWVyoAUi6HqKtkBJjOVwHLx4sF9pxSucXR',
  access_token:'607071332-Wqo3B6CDXkUGYaFXYLI1gYFvL1q3iOlT7UsKe07T',
  access_token_secret:'7HzhpqTNfoO2W72CgpLqrXQlB05BuweyvKnHuu6SIeYC0'
});

var stream = Twit.stream('user');
stream.on('tweet', function (tweet) {
  Fiber(function() {
    var cur = Tweets.findOne({});
    if (cur) {
      Tweets.remove(cur._id);
    }
    console.log(tweet);
  }).run();

  // Meteor.bindEnvironment(function(){
  //   var fiber = Fiber.current;
  //   console.log(fiber);
  //   var cur = Tweets.findOne({});
  //   if (cur) {
  //     Tweets.remove(cur._id);
  //   }
  //   console.log(tweet);
  // })
  // var cur = Tweets.findOne({});
  // if (cur) {
  //   Tweets.remove(cur._id);
  // }
  // var cur = Tweets.findOne({});
  // if (cur){
  //   // Tweets.remove(cur._id);
  //   console.log(cur);
  // }


});
