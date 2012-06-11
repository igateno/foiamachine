var ViewRequestView = FOIAView.extend({

  initialize: function() {
    this.template = _.template(tpl.get('view_request'));
  },

  events: {
    'click button.back':'back',
    'click #email-headers tr':'viewBody'
  },

  partials: {
    row: '<tr data-id="<%= id %>"><td><%= from %></td><td><%= to %></td><td><%= subject %></td><td><%= date %></td></tr>'
  },

  render: function() {
    $(this.el).html(this.template({
      id: this.model.get('id')
    }));

    var self = this;
    this.model.fetchEmails({
      success: function() {
        self.populate();
      },
      error: function () {
        self.alert(false, 'There was an error loading the page');
      }
    });

    return this;
  },

  populate: function() {
    _.each(this.model.get('emails'), function(element, index, list) {
      var row = _.template(this.partials.row);
      $('#email-headers tbody').append(row({
        id: element.id,
        from: element.outgoing ? $.cookie('username') : element.agency,
        to: element.outgoing ? element.agency : $.cookie('username'),
        subject: element.subject,
        date: element.date
      }));
    }, this);
  },

  back: function (e) {
    e.preventDefault();
    app.navigate('dash', {trigger: true});
  },

  bodyForId: function (id) {
    var result = null;
    _.each(this.model.get('emails'), function(element, index, list) {
      if (element.id == id) {
        result = element.body;
      }
    }, this);
    return result;
  },

  viewBody: function (e) {
    e.preventDefault();
    var id = $(e.target).parent().attr('data-id');
    var body = this.bodyForId(id);
    if (!body) {
      this.alert(false, 'There seems to be something wrong.');
      return;
    }
    var template = _.template(body);
    $('#email-body').html(template());
  }

});

var DashView = FOIAView.extend({

  initialize: function() {
    this.template = _.template(tpl.get('dashboard'));
  },

  events: {
    'click #request-menu table tr': 'viewRequest',
    'click button.new-request':'newRequest',
    'click a.add-agency':'newAgency',
    'click a.add-relation':'newRelation'
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
  },

  newRequest: function(e) {
    e.preventDefault();
    app.navigate('', {trigger: true});
  },

  newAgency: function(e) {
    e.preventDefault();
    var agency = new Agency();
    var agencyFormView = new AgencyFormView({model: agency});
    $('#new-agency').html(agencyFormView.render().el);
    $('#agency-modal').modal('show');
  },

  newRelation: function(e) {
    e.preventDefault();
    var relation = new CCRelation({type: 1});
    var ccFormView = new CCFormView({model: relation});
    $('#new-cc-relation').html(ccFormView.render().el);
    $('#cc-modal').modal('show');
  }

});
