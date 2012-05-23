/*
 * This code draws inspiration from the article at
 * blog.opperator.com/post/15671431847/backbone-js-sessions-and-authentication
 */

var Session = Backbone.Model.extend({

  url: "api/auth",

  defaults: {
    username: '',
    password: '',
    token: ''
  },

  login: function(callbacks) {
    var self = this;
    this.save(null, {
      success: function(model, response) {
        self.set({
          password: '',
          token: response.token
        });
        if (response.token.length > 0) {
          $.cookie('token', response.token);
          callbacks.good();
        } else {
          callbacks.bad();
        }
      },
      error: function(model, response) {
        // TODO for actual error
        self.set({password: ''});
      }
    });
  }

});
