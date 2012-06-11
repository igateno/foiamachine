var ViewRequestView = FOIAView.extend({

  initialize: function() {
    this.template = _.template(tpl.get('view_request'));
  },

  events: {
    'click button.back':'back'
  },

  render: function() {
    $(this.el).html(this.template({
      id: this.model.get('id')
    }));
    return this;
  },

  back: function (e) {
    e.preventDefault();
    app.navigate('dash', {trigger: true});
  }

});

var DashView = FOIAView.extend({

  initialize: function() {
    this.template = _.template(tpl.get('dashboard'));
  },

  events: {
    'click #request-menu table tr': 'viewRequest'
  },

  partials: {
    row: '<tr data-id="<%= id %>"><td><%= country %></td><td><%= topic %></td><td><%= question %></td></tr>'
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
        id: element.id,
        country: element.country,
        topic: element.topic,
        question: element.question
      }))
    }, this);
  },

  viewRequest: function (e) {
    e.preventDefault();
    var id = $(e.target).parent().attr('data-id');
    app.navigate('request/'+id, {trigger: true});
  }

});
