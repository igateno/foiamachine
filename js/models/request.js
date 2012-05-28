var Request = Backbone.Model.extend({

  url: 'api/requestTabs',

  defaults: function() {
    return {
      country: '',
      topic: '',
      token: '',
    }
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
      self.set('suggestions', results);
      callback();
    });
  },

  saveAgencies: function(checkboxes) {
    this.set('agencies', [])
    _.each(checkboxes, function(element, index, list) {
      this.get('agencies').push(element.id);
    }, this);
    console.log(this.get('agencies'));
  }

});
