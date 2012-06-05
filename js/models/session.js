var Session = Backbone.Model.extend({

  url: "api/auth",

  defaults: {
    username: '',
    password: '',
  },

  setCookie: function (response, callbacks) {
    if (response.token.length > 0) {
      $.cookie('username', this.get('username'));
      $.cookie('token', response.token);
      callbacks.good();
    } else {
      callbacks.bad(response.error);
    }
  },

  login: function(callbacks) {
    var self = this;
    this.set('id', 0); // hack to force a PUT
    this.save(null, {
      success: function(model, response) {
        self.set('password', '');
        self.setCookie(response, callbacks);
      },
      error: function(model, response) {
        // TODO for actual error
        self.set('password', '');
      }
    });
  },

  register: function(callbacks) {
    var self = this;
    this.save(null, {
      success: function(model, response) {
        self.set('password', '');
        self.setCookie(response, callbacks);
      },
      error: function(model, response) {
        // TODO
        self.set('password', '');
      }
    });
  }

});
