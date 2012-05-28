var Request = Backbone.Model.extend({

  url: 'api/requestTabs',

  defaults: {
    country: '',
    topic: '',
    token: '',
  },

  fetchTabs: function(callback) {
    this.set('token', $.cookie('token'));

    var self = this;

    $.ajax({
      url: 'api/agencyTabs',
      type: 'POST',
      data: JSON.stringify(this),
      dataType: 'json'
    }).done(function(results) {
      self.set('agencies', results);
      callback();
    });
  },

  iterateTabs: function(ifunc, context) {
    _.each(this.get('agencies'), ifunc, context);
  }

});
