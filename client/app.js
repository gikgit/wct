/*****************************************************************************/
/* Subscriptions */
/*****************************************************************************/
Meteor.subscribe('comments');
Meteor.subscribe('users');
Meteor.subscribe('rooms');

/*****************************************************************************/
/* Initial State */
/*****************************************************************************/
Session.set('activeRoom', 'main');
Session.set('showInviteConfirm', false);
Session.set('showRoomAddDialog', false);

/*****************************************************************************/
/* RPC Methods */
/*****************************************************************************/
Meteor.methods({
  inviteFriend: function (email) {
    Session.set('showInviteConfirm', true);
  }
});

/*****************************************************************************/
/* Template Helpers */
/*****************************************************************************/
Template.Navigation.helpers({
  mainRoom: function () {
    return Rooms.findOne({name: 'main'});
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
    var user = Meteor.users.findOne({'profile.login': comment.login});
    return user.profile.avatarUrl;
  }
});

/*****************************************************************************/
/* Template Events */
/*****************************************************************************/
Template.Navigation.events({
  'click [data-room-add]': function (e, tmpl) {
    Session.set('showRoomAddDialog', true);
  },

  'change [room-select]': function (e, tmpl) {
    name = Template.instance().$('[room-select] option:selected').val();
    Session.set('activeRoom', name);
  },

  'submit form[data-invite]': function (e, tmpl) {
    e.preventDefault();

    var form = e.target;
    var email = tmpl.find('[name=email]').value;
    form.reset();

    Meteor.call('inviteFriend', email);
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
      login: user.profile.login,
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
Template.Navigation.onCreated(function(){
    if (this.view.isRendered){
        this.$('.ui.dropdown').dropdown({allowAdditions: true});
        this.$('option.active').attr('selected','selected');    
    }
});


