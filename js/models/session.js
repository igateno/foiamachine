var Session = Backbone.Model.extend({

  url: "api/auth",

  /*
   * There are two user types
   * 1 - journalist
   * 2 - restricted
   */
  defaults: {
    username: '',
    password: '',
  },

  setCookie: function (response, callbacks) {
    $.cookie('username', this.get('username'));
    $.cookie('token', response.token);
    callbacks.good();
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
        self.set('password', '');
        console.log(response);
        callbacks.bad(response.error);
      }
    });
  },

  register: function(callbacks) {
    var self = this;
    this.set('type', 2);
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
