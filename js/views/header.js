var HeaderView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('header'));
  },

  events: {
    'click .navbar a.dash':'dash',
    'click .navbar a.request':'request',
    'click .navbar a.forms':'forms'
  },

  render: function() {
    $(this.el).html(this.template());
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
  }

});
