var LoginView = FOIAView.extend({

  initialize: function() {
    this.template = _.template(tpl.get('login'));
  },

  events: {
    'click #request-start input.gobtn': 'startRequest',
    'keypress #request-start input.country': 'startRequestEnter',
    'click #login button': 'login',
    'keypress #login input': 'loginEnter',
  },

  render: function() {
    $(this.el).addClass('span12').html(this.template());

    var self = this;

    this.countries = new CountryCollection();
    this.countries.fetch({
      success: function(model, response) {
        self.$('#request-start input.country').typeahead({
          source: self.countries.nameArray()
        });
      },
      error: function() {
        self.alert(false, 'There was an error loading the page.');
      }
    });

    return this
  },

  startRequest: function(e) {
    e.preventDefault();

    var cname = $('#request-start input.country').val();

    if (cname.length == 0) return;

    var cid = this.countries.idForName(cname);
    if (cid == null) {
      this.alert(false, "We're sorry. That country is not supported yet.");
      return;
    }

    var request = new Request({
      country: cid,
      country_name: cname
    });
    app.requestView = new RequestView({model: request});
    $('#container').html(app.requestView.render().el);
  },

  startRequestEnter: function(e) {
    if (e.keyCode == 13) this.startRequest(e);
  },

  login: function(e) {
    e.preventDefault();

    if ($('#login .username input').val().length == 0) {
      this.alert(false, 'Username cannot be blank.');
      return;
    }
    if ($('#login .password input').val().length == 0) {
      this.alert(false, 'Password cannot be blank.');
      return;
    }

    this.model.set({
      username: $('#login .username input').val(),
      password: $('#login .password input').val()
    });

    var self = this;
    this.model.login({
      success: function() {
        $('#signin-modal').modal('hide');
        app.headerView.render();
        app.navigate('dash', {trigger: true});
      },
      error: function(errstr) {
        self.alert(false, 'Invalid username or password');
      }
    });
  },

  loginEnter: function(e) {
    if (e.keyCode == 13) this.login(e);
  }

});
