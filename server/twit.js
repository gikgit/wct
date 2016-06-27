Fiber = Npm.require('fibers');

Twit = new TwitMaker({
  consumer_key:'0GhQDs3VxlXktYaoc4mFD1Gpa',
  consumer_secret:'XduJksDuqjIeXAv4LWVyoAUi6HqKtkBJjOVwHLx4sF9pxSucXR',
  access_token:'607071332-Wqo3B6CDXkUGYaFXYLI1gYFvL1q3iOlT7UsKe07T',
  access_token_secret:'7HzhpqTNfoO2W72CgpLqrXQlB05BuweyvKnHuu6SIeYC0'
});

var stream = Twit.stream('user');
stream.on('tweet', function (tweet) {
  Fiber(function() {
    var count = Tweets.find({}).count();
    if (count == 1) {
      cur = Tweets.findOne({});
      Tweets.remove(cur._id);
      Tweets.insert(tweet);
    }else{
      cur = Tweets.findOne({});
      Tweets.remove(cur._id);
    }
  }).run();


});
