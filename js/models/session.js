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

  authenticated: function () {
    return this.get('token').length > 0 ? true : false;
  },

  login: function() {
    this.save();
    this.set({password:''});
    // invoke callbacks
  }

});
