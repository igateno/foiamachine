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

  setCookie: function (token, callback) {
    $.cookie('username', this.get('username'));
    $.cookie('token', token);
    callback();
  },

  login: function(callbacks) {
    var self = this;
    this.set('id', 0); // hack to force a PUT
    this.save(null, {
      success: function(model, response) {
        self.set('password', '');
        self.setCookie(response.token, callbacks.success);
      },
      error: function(model, response) {
        self.set('password', '');
        callbacks.error(jQuery.parseJSON(response.responseText).error);
      }
    });
  },

  register: function(callbacks) {
    var self = this;
    this.set('type', 2);
    this.save(null, {
      success: function(model, response) {
        self.set('password', '');
        self.setCookie(response.token, callbacks.success);
      },
      error: function(model, response) {
        self.set('password', '');
        callbacks.error(jQuery.parseJSON(response.responseText).error);
      }
    });
  },

});
