var LoginView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('login'));
  },

  events: {
    'click #login a.login': 'login',
    'keypress #password input': 'loginEnter'
  },

  render: function() {
    $(this.el).addClass('span12').html(this.template());
    return this
  },

  alert: function(success, message) {
    var alertView = new Backbone.View();
    alertView.template = _.template($('#alert-template').html());
    $(alertView.el).html(alertView.template());

    if (success) {
      alertView.$('.alert').addClass('alert-success');
    } else {
      alertView.$('.alert').addClass('alert-error');
    }
    alertView.$('.message').html(message);

    $('#alert-container').html(alertView.el);
  },

  login: function(e) {
    e.preventDefault();

    if ($('#username input').val().length == 0) {
      this.alert(false, 'Username cannot be blank.');
      return;
    }
    if ($('#password input').val().length == 0) {
      this.alert(false, 'Password cannot be blank.');
      return;
    }

    this.model.set({
      username: $('#username input').val(),
      password: $('#password input').val()
    });
    var self = this;
    this.model.login({
      good: function() {
        self.alert(true, 'You logged in!');
        app.navigate('forms', {trigger: true});
      },
      bad: function() {
        self.alert(false, 'Username and/or password incorrect');
      }
    });
  },

  loginEnter: function(e) {
    if (e.keyCode == 13) this.login(e);
  }

});
