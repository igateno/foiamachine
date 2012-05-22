/*
 * This code draws inspiration from the article at
 * blog.opperator.com/post/15671431847/backbone-js-sessions-and-authentication
 */

var Session = Backbone.Model.extend({

  url; "api/auth",

  defaults: {
    "id": null,
    "token": null
  },

  authenticated: function () {
    return model.get('token') ? true : false;
  },

  save: function (id, token) {
    $.cookie('id', id);
    $.cookie('token', token);
  },

  load: function () {
    model.set({
      id: $.cookie('id');
      token: $.cookie('token');
    });
  }

});
