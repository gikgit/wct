
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
  // var google_user = {};
  // options.profile.name = user.services.google.name;
  // options.profile.email = user.services.google.email;
  // options.profile.picture = user.services.google.picture;

  // google_user.profile = options.profile;
  // return options;
  options.profile.login = user.services.github.username;
  options.profile.email = user.services.github.email;

  var accessToken = user.services.github.accessToken;
  var username = options.profile.login;

  // add header Authorization: token <token>
  var apiOptions = {
    headers: {
      'Authorization': 'token ' + accessToken,
      'User-Agent': 'eventedmind-devel'
    }
  };

  var url = 'https://api.github.com/users/' + username;
  var response = HTTP.get(url, apiOptions);

  options.profile.avatarUrl = response.data.avatar_url;
  options.profile.githubId = response.data.id;
  options.profile.url = response.data.html_url;

  user.profile = options.profile;
  return user;
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
