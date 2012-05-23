var EntityFormView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template($('#new-entity-template').html());
  },

  events: {
    'click a.add-entity': 'addCountry',
    'keypress input.name': 'countryEnter'
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  addCountry: function(e) {
    e.preventDefault();

    if (this.$('input.name').val().length == 0)
      return;

    var self = this;
    this.model.set({
      name: this.$('input.name').val(),
    });
    this.model.save(null, {
      success: function(model) {
        self.model = new Entity();
        self.render();
        $('#feedback').html('Success!');
      },
      error: function() {
        $('#feedback').html('Error adding entity.');
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

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  populate: function() {
    if (!this.countryFormView) {
      var country = new Entity({type: 1});
      this.countryFormView = new EntityFormView({model:country});
    }
    $('#new-country').append(this.countryFormView.render().el);
    if (!this.agencyFormView) {
      var agency = new Entity({type: 2});
      this.agencyFormView = new EntityFormView({model:agency});
    }
    $('#new-agency').append(this.agencyFormView.render().el);
    if (!this.topicFormView) {
      var topic = new Entity({type: 3});
      this.topicFormView = new EntityFormView({model:topic});
    }
    $('#new-topic').append(this.topicFormView.render().el);
  },

});
