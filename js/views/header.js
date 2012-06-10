var HeaderView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('header'));
  },

  events: {
    'click .navbar a.dash':'dash',
    'click .navbar a.request':'request',
    'click .navbar a.forms':'forms',
    'click .navbar a.logout':'logout'
  },

  render: function() {
    var authed = $.cookie('token') ? true : false;
    $(this.el).html(this.template({authed: authed}));
    return this;
  },

  dash: function() {
    app.navigate('dash', {trigger: true});
  },

  request: function() {
    app.navigate('request', {trigger: true});
  },

  forms: function() {
    app.navigate('forms', {trigger: true});
  },

  logout: function() {
    $.cookie('username', null);
    $.cookie('token', null);
    app.navigate('login', {trigger: true});
  }

});
