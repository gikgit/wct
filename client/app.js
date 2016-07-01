/*****************************************************************************/
/* Subscriptions */
/*****************************************************************************/
Meteor.subscribe('comments');
Meteor.subscribe('users');
Meteor.subscribe('rooms');
Meteor.subscribe('tweets');

/*****************************************************************************/
/* Initial State */
/*****************************************************************************/
Session.set('activeRoom', 'greeting');
Session.set('showInviteConfirm', false);
Session.set('showRoomAddDialog', false);

/*****************************************************************************/
/* RPC Methods */
/*****************************************************************************/
// Meteor.methods({
//   inviteFriend: function (email) {
//     Session.set('showInviteConfirm', true);
//   }
// });

/*****************************************************************************/
/* Template Helpers */
/*****************************************************************************/
Template.Menu.helpers({
  mainRoom: function () {
    return Rooms.findOne({name: 'greeting'});
  },

  rooms: function () {
    return Rooms.find({}, {sort: {name: 1}});
  },

  isRoomActiveClass: function () {
    return Session.equals('activeRoom', this.name) ? 'selected' : '';
  },

  showInviteConfirm: function () {
    return Session.equals('showInviteConfirm', true);
  }
});

Template.Room.helpers({
  activeRoom: function () {
    return Session.get('activeRoom');
  }
});

Template.Twits.helpers({
  twitsList: function () {
    // console.log(Tweets.find({}, {sort: {timestamp_ms: -1}}).fetch());
    return Tweets.find({}, {sort: {timestamp_ms: -1}});
  }
});

Template.TwitsItem.helpers({
  content: function() {
    re = /http[s]?/i;
    found = this.text.match(re);
    info = {};
    urls = [];
    if (found.index) {
      info.con = this.text.slice(0, found.index);
      url = this.text.slice(found.index, this.text.length);
      urls = url.split(" ");
      info.url = urls.pop();
    }

    if (this.entities.media) {
      info.img = this.entities.media[0].media_url;
    }
    return info;
  }
});


Template.RoomAddDialog.helpers({
  showRoomAddDialog: function () {
    return Session.equals('showRoomAddDialog', true);
  }
});

Template.CommentList.helpers({
  comments: function () {
    var room = Session.get('activeRoom');
    return Comments.find({room: room}, {sort: {timestamp: 1}});
  }
});

Template.CommentItem.helpers({
  formattedTimestamp: function (timestamp) {
    return moment(timestamp).calendar();
  },

  avatarUrl: function () {
    var comment = this;
    var user = Meteor.users.findOne({'profile.email': comment.email});
    return user.profile.picture;
  }

});

Template.registerHelper('formatDate', function(date) {
  return moment(Number(date)).calendar();
});
/*****************************************************************************/
/* Template Events */
/*****************************************************************************/
Template.Menu.events({
  'click [data-room-add]': function (e, tmpl) {
    Session.set('showRoomAddDialog', true);
    tmpl.$('.ui.sidebar').sidebar('setting','transition','overlay').sidebar('toggle');
  },

  'click [data-room]': function(e, tmpl) {
    Session.set('activeRoom', this.name);
    tmpl.$('.ui.sidebar').sidebar('setting','transition','overlay').sidebar('toggle');
  },

  'submit form[data-invite]': function (e, tmpl) {
    e.preventDefault();

    var form = e.target;
    var email = tmpl.find('[name=email]').value;
    form.reset();

    Meteor.call('inviteFriend', email);
  },

  'click .login-button': function(e, tmpl){
    tmpl.$('.ui.sidebar').sidebar('setting','transition','overlay').sidebar('toggle');
  }
});

Template.Room.events({
  'click .main-list': function(e, tmpl) {
    e.preventDefault();
    tmpl.parentTemplate(1).$('.ui.sidebar').sidebar('setting','transition','overlay').sidebar('toggle');
  }
});


Template.RoomAddDialog.events({
  'submit form': function (e, tmpl) {
    e.preventDefault();

    var form = tmpl.find('form');
    var roomName = tmpl.find('input[name=room]').value;

    form.reset();

    if (roomName.trim() === "")
      return;

    if (Rooms.findOne({name: roomName}))
      return;

    Rooms.insert({
      name: roomName
    });

    Session.set('showRoomAddDialog', false);
    Session.set('activeRoom', roomName);
  },

  'click [data-cancel]': function (e, tmpl) {
    e.preventDefault();
    var form = tmpl.find('form');
    form.reset();
    Session.set('showRoomAddDialog', false);
  }
});

Template.CommentAdd.events({
  'submit form': function (e, tmpl) {
    e.preventDefault();

    var form = tmpl.find('form');
    var comment = tmpl.find('[name=comment]').value;
    var user = Meteor.user();

    if (comment.trim() === "")
      return;

    Comments.insert({
      name: user.profile.name,
      email: user.profile.email,
      timestamp: new Date(),
      room: Session.get('activeRoom'),
      comment: comment
    });

    var scrollHeight = $('.comment-list').height();
    $(".main-list").animate({ scrollTop: scrollHeight }, "slow");
    form.reset();
  }
});

//
//
Template.Menu.onCreated(function(){
    if (this.view.isRendered){
        this.$('.ui.dropdown').dropdown({allowAdditions: true});
        this.$('option.active').attr('selected','selected');
    }
});



// Template.Video.events({
//     "click #makeCall": function () {
//       var outgoingCall = peer.call($('#remotePeerId').val(), window.localStream);
//       window.currentCall = outgoingCall;
//       outgoingCall.on('stream', function (remoteStream) {
//         window.remoteStream = remoteStream;
//         var video = document.getElementById("theirVideo");
//         video.src = URL.createObjectURL(remoteStream);
//       });
//     },
//
//     "click #endCall": function () {
//       window.currentCall.close();
//     }
//   });


// Template.Video.onCreated(function () {
//       window.peer = new Peer({
//         key: '7xjby7yjhn8tcsor',
//         debug: 3,
//         config: {'iceServers': [
//           { url: 'stun:stun.l.google.com:19302' },
//           { url: 'stun:stun1.l.google.com:19302' },
//         ]}
//       });
//
//     // Handle event: upon opening our connection to the PeerJS server
//     peer.on('open', function () {
//       $('#myPeerId').text(peer.id);
//     });
//
//     // Handle event: remote peer receives a call
//     peer.on('call', function (incomingCall) {
//       window.currentCall = incomingCall;
//       incomingCall.answer(window.localStream);
//       incomingCall.on('stream', function (remoteStream) {
//         window.remoteStream = remoteStream;
//         var video = document.getElementById("theirVideo");
//         video.src = URL.createObjectURL(remoteStream);
//       });
//     });
//
//     navigator.getUserMedia = ( navigator.getUserMedia ||
//                             navigator.webkitGetUserMedia ||
//                             navigator.mozGetUserMedia ||
//                             navigator.msGetUserMedia );
//
//     // get audio/video
//     navigator.getUserMedia({audio:true, video: true}, function (stream) {
//         //display video
//         var video = document.getElementById("myVideo");
//       video.src = URL.createObjectURL(stream);
//         window.localStream = stream;
//       },
//       function (error) { console.log(error); }
//     );
//
//   });





Blaze.TemplateInstance.prototype.parentTemplate = function(levels) {
  var view = Blaze.currentView;
  if (typeof levels === "undefined") {
    levels = 1;
  }
  while (view) {
    if (view.name.substring(0, 9) === "Template." && !(levels--)) {
      return view.templateInstance();
    }
    view = view.parentView;
  }
};
