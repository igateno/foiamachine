var RequestAgency = Backbone.Model.extend({

  urlRoot: 'api/requestAgencies',

  defaults: {
    username: $.cookie('username'),
    token: $.cookie('token'),
    request_log_id: null,
    agency_id: null
  }

});

var RequestAgencyCollection = FoiaCollection.extend({

  model: RequestAgency,

  url: 'api/requestAgencies',

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

  url: 'api/requestLog',

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

  setAgencies: function(checkboxes) {
    this.set('agencies', new RequestAgencyCollection())
    _.each(checkboxes, function(element, index, list) {
      this.get('agencies').create({
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
