var RequestAgency = Backbone.Model.extend({

  urlRoot: 'api/requestAgencies',

  defaults: function() {
    return {
      username: $.cookie('username'),
      token: $.cookie('token'),
      request_log_id: null,
      agency_id: null
    }
  }
});

var RequestAgencyCollection = FoiaCollection.extend({

  model: RequestAgency,

  url: 'api/requestAgencies',

});

var RequestDoctype = Backbone.Model.extend({

  urlRoot: 'api/requestDoctypes',

  defaults: function() {
    return {
      username: $.cookie('username'),
      token: $.cookie('token'),
      request_log_id: null,
      doctype_id: null
    }
  }
});

var RequestDoctypeCollection = FoiaCollection.extend({

  model: RequestDoctype,

  url: 'api/requestDoctypes'

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

  setAgencies: function(checkboxes, callbacks) {
    this.set('agencies', new RequestAgencyCollection())
    _.each(checkboxes, function(element, index, list) {
      this.get('agencies').create(
      {
        request_log_id: this.id,
        agency_id: element.id
      },
      {
        success: function(model, response) {
          callbacks.success();
        },
        error: function(model, response) {
          callbacks.error()
        }
      });
    }, this);
  },

  setDoctypes: function(buttons, callbacks) {
    this.set('doctypes', new RequestDoctypeCollection())
    _.each(buttons, function(element, index, list) {
      this.get('doctypes').create(
      {
        request_log_id: this.id,
        doctype_id: $(element).attr('id')
      },
      {
        success: function(model, response) {
          callbacks.success();
        },
        error: function(model, response) {
          callbacks.error()
        }
      }
      );
    }, this);
  }
});
