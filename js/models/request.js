var RequestAgency = Backbone.Model.extend({

  urlRoot: 'api/requestAgencies',

  defaults: {
    request_log_id: null,
    agency_id: null
  }

});

var RequestAgencyCollection = FoiaCollection.extend({

  model: RequestAgency,

  url: 'api/requestAgencies'

});

var RequestDoctype = Backbone.Model.extend({

  urlRoot: 'api/requestDoctypes',

  defaults: {
    request_log_id: null,
    doctype_id: null
  }

});

var RequestDoctypeCollection = FoiaCollection.extend({

  model: RequestDoctype,

  url: 'api/requestDoctypes'

});

var Request = Backbone.Model.extend({

  url: 'api/requestTabs',

  defaults: {
    username: '',
    token: '',
    country: '',
    topic: '',
    start: '',
    end: '',
    question: ''
  },

  initialize: function() {
    this.set('username', $.cookie('username'));
    this.set('token', $.cookie('token'));
  },

  fetchTabs: function(callback) {
    var self = this;
    $.ajax({
      url: 'api/agencyTabs',
      type: 'POST',
      data: JSON.stringify(this),
      dataType: 'json'
    }).done(function(results) {
      self.set('suggestions', results);
      callback();
    });
  },

  // TODO sync the request once you have the minimum
  // any additional info gets done via update
  // Make it so that agencies and doctypes are set as collections
  // wich each syncing to a row in their respective tables

  setAgencies: function(checkboxes) {
    this.set('agencies', new RequestAgencyCollection())
    _.each(checkboxes, function(element, index, list) {
      this.get('agencies').add({
        request_log_id: this.id,
        agency_id: element.id
      });
    }, this);
  },

  setDoctypes: function(buttons) {
    this.set('doctypes', [])
    _.each(buttons, function(element, index, list) {
      this.get('doctypes').push($(element).attr('id'));
    }, this);
  }

});
