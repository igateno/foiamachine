var CountryFormView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('country-form'));
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
        // TODO this should remove the current form and
        // replace it with a new one
        // Then it should render the entities
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

var FormsView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('forms'));
  },

  events: {
    "click #feedback a": "tabs",
    "click #save_new_country": "saveNewCountry"
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  tabs: function(e) {
    e.preventDefault();
    $(this).tab('show');
  },

  saveNewCountry: function(e) {
    e.preventDefault();
    console.log("Saving new country...");
  }

});
