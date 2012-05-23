var LoginView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('login'));
  },

  events: {
    'click #div-login a.login': 'login'
  },

  render: function() {
    $(this.el).html(this.template());
    return this
  },

  login: function(e) {
    e.preventDefault();

    // TODO give user feeback
    if ($('#username input').val().length == 0) return;
    if ($('#password input').val().length == 0) return;

    this.model.set({
      username: $('#username input').val(),
      password: $('#password input').val()
    });
    this.model.login();
  }

});
