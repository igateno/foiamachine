var RequestEmail = Backbone.Model.extend({

  url: 'api/requestEmails',

  defaults: function () {
    return {
      request_log_id: 0,
      subject: '',
      body: '',
      outgoing: 0,
      username: $.cookie('username'),
      token: $.cookie('token')
    }
  }

});

var Request = Backbone.Model.extend({

  url: 'api/requestLog',

  defaults: {
    username: '',
    token: '',
    country: '',
    topic: '',
    start: null,
    end: null,
    question: ''
  },

  initialize: function() {
    this.set('username', $.cookie('username'));
    this.set('token', $.cookie('token'));
  },

  fetchSuggestions: function(callbacks) {
    var self = this;
    $.ajax({
      url: 'api/agencyTabs',
      type: 'POST',
      data: JSON.stringify(this),
      dataType: 'json'
    }).done(function(results) {
      self.set('suggestions', results);
      callbacks.success();
    }).fail(function() {
      callbacks.error();
    });
  },

  fetchPreviews: function(callbacks) {
    var self = this;
    $.ajax({
      url: 'api/requestPreviews',
      type: 'POST',
      data: JSON.stringify(this),
      dataType: 'json'
    }).done(function(results) {
      self.set('previews', results);
      callbacks.success();
    }).fail(function() {
      callbacks.error();
    });
  },

  setCheckboxes: function(checkboxes, key) {
    this.set(key, []);
    _.each(checkboxes, function(element, index, list) {
      this.get(key).push(element.id);
    }, this);
  },

});
