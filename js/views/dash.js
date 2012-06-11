var DashView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('dashboard'));
  },

  partials: {
    row: '<tr><td><%= country %></td><td><%= topic %></td><td><%= question %></td></tr>'
  },

  render: function() {
    $(this.el).html(this.template({
      username: $.cookie('username')
    }));

    var self = this;
    this.model.fetchRequestRows({
      success: function() {
        self.insertRows();
      },
      error: function() {
        self.alert(false, 'There was an error loading the dash.');
      }
    });

    return this;
  },

  insertRows: function() {
    _.each(this.model.get('rows'), function(element, index, list) {
      var row = _.template(this.partials.row);
      $('#request-menu tbody').append(row({
        country: element.country,
        topic: element.topic,
        question: element.question
      }))
    }, this);
  }

});
