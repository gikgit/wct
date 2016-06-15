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
    var user = Meteor.users.findOne({'profile.email':comment.email});
    return user.profile.picture;
  }
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
