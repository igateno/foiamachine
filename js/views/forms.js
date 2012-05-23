var CountryFormView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template($('#new-country-template').html());
  },

  events: {
    'click #add-country': 'addCountry',
    'keypress #new-country #name': 'countryEnter'
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  addCountry: function(e) {
    e.preventDefault();
    var self = this;
    this.model.set({
      name: $('#new-country #name').val(),
      type: 1
    });
    this.model.save(null, {
      success: function(model) {
        self.model = new Entity();
        self.render();
        $('#feedback').html('Success!');
      },
      error: function() {
        $('#feedback').html('error');
      }
    });
  },

  countryEnter: function(e) {
    if (e.keyCode == 13) this.addCountry(e);
  }

});

var AgencyFormView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template($('#new-agency-template').html());
  },

  events: {
    'click #add-agency': 'addAgency',
    'keypress #new-agency #name': 'agencyEnter'
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  addAgency: function(e) {
    e.preventDefault();
    var self = this;
    this.model.set({
      name: $('#new-agency #name').val(),
      type: 2
    });
    this.model.save(null, {
      success: function(model) {
        self.model = new Entity();
        self.render();
        $('#feedback').html('Success!');
      },
      error: function() {
        $('#feedback').html('error');
      }
    });
  },

  agencyEnter: function(e) {
    if (e.keyCode == 13) this.addAgency(e);
  }

});

var FormsView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('forms'));
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  populate: function() {
    if (!this.countryFormView) {
      var country = new Entity();
      this.countryFormView = new CountryFormView({model:country});
    }
    $('#new-country-container').html(this.countryFormView.render().el);
    if (!this.agencyFormView) {
      var agency = new Entity();
      this.agencyFormView = new AgencyFormView({model:agency});
    }
    $('#new-agency-container').html(this.agencyFormView.render().el);
  },

});
