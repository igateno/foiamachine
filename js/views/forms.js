var EntityTableView = FOIAView.extend({

  initialize: function() {
    this.template = _.template($('#etable-template').html());
  },

  partials: {
    row: '<tr><td><%= id %></td><td><%= name %></td></tr>'
  },

  render: function() {
    $(this.el).html(this.template());

    if (!this.model) {
      this.alert(false, 'Error displaying the page.');
    }

    var self = this;
    this.model.fetch({
      success: function(model, response) {
        _.each(response, function (element, index, list) {
          var template = _.template(this.partials.row);
          this.$('tbody').append(template({
            id: index,
            name: element.name
          }));
        }, self);
      },
      error: function() {
        this.alert(false, 'Error displaying the page.');
      }
    });

    return this;
  }
});

var EntityFormView = FOIAView.extend({

  initialize: function() {
    this.template = _.template($('#new-entity-template').html());
  },

  events: {
    'click a.add-entity': 'addEntity',
    'keypress input.name': 'countryEnter'
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  // TODO when a new entity is added, it should also be added to the
  // typeaheads for the relation forms so that the page doesn't have
  // to reload
  addEntity: function(e) {
    e.preventDefault();

    if (this.$('input.name').val().length == 0)
      return;

    var self = this;
    this.model.set({
      name: this.$('input.name').val(),
    });
    this.prevType = this.model.get('type');
    this.model.save(null, {
      success: function(model, response) {
        self.model = new Entity({type:self.prevType});
        self.render();
        self.alert(true, 'Successfully added entity.');
      },
      error: function(model, response) {
        self.alert(false, 'Error adding entity.');
      }
    });
  },

  countryEnter: function(e) {
    if (e.keyCode == 13) this.addEntity(e);
  }

});

var CCFormView = FOIAView.extend({

  initialize: function() {
    this.template = _.template($('#cc-template').html());
  },

  events: {
    'click #new-cc-relation a.add-cc':'addCountryCountry',
    'keypress #new-cc-relation input.country':'addCountryCountryEnter'
  },

  render: function() {
    $(this.el).html(this.template());

    this.countries = new CountryCollection();
    this.countries.fetch();
    this.$('input.country').typeahead({
      source: this.countries.nameArray()
    });

    return this;
  },

  // TODO right now duplicate entries just cause an error
  // Should somehow detect the duplicate or not allow it in the front end
  // One way could be to somhow generate the second typeahead based on
  // what's in the first one.
  addCountryCountry: function(e) {
    e.preventDefault();

    if ($('#new-cc-relation input.c1').val().length == 0 ||
        $('#new-cc-relation input.c2').val().length == 0) {
      this.alert(false, 'Please select two countries to insert relation');
      return;
    }

    var id1 = this.countries.idForName($('#new-cc-relation input.c1').val());
    var id2 = this.countries.idForName($('#new-cc-relation input.c2').val());

    if (!id1 || !id2) {
      this.alert(false, 'Please select countries from the typeahead.');
      return;
    }

    var self = this;
    var type = this.model.get('type');
    this.model.save(
    {
      id1: id1,
      id2: id2
    },
    {
      success: function(model, response) {
        self.model = new Relation({type: type});
        self.render();
        self.alert(true, 'Successfully added Country-Country relation.');
      },
      error: function(model, response) {
        self.alert(false, 'Oops! Something went wrong saving that relation!');
      }
    }
    );
  },

  addCountryCountryEnter: function(e) {
    if (e.keyCode == 13) this.addCountryCountry(e);
  }

});

var CATFormView = FOIAView.extend({

  initialize: function() {
    this.template = _.template($('#cat-template').html());
  },

  events: {
    'click #new-cat-relation a.add-cat':'addCAT',
    'keypress #new-cat-relation input':'addCATEnter'
  },

  render: function() {
    $(this.el).html(this.template());

    this.countries = new CountryCollection();
    this.countries.fetch();
    this.$('input.country').typeahead({
      source: this.countries.nameArray()
    });

    this.agencies = new AgencyCollection();
    this.agencies.fetch();
    this.$('input.agency').typeahead({
      source: this.agencies.nameArray()
    });

    this.topics = new TopicCollection();
    this.topics.fetch();
    this.$('input.topic').typeahead({
      source: this.topics.nameArray()
    });
    return this;
  },

  addCAT: function(e) {
    e.preventDefault();

    if ($('#new-cat-relation input.country').val().length == 0) {
      this.alert(false, 'Please enter a country for this relation.');
      return;
    }

    if ($('#new-cat-relation input.agency').val().length == 0) {
      this.alert(false, 'Please enter an agency for this relation.');
      return;
    }

    if ($('#new-cat-relation input.topic').val().length == 0) {
      this.alert(false, 'Please enter a topic for this relation.');
      return;
    }

    var cid =
      this.countries.idForName($('#new-cat-relation input.country').val());
    var aid =
      this.agencies.idForName($('#new-cat-relation input.agency').val());
    var tid = this.topics.idForName($('#new-cat-relation input.topic').val());

    if (!cid || !aid || !tid) {
      this.alert(false, 'Please use values from the typeahead.');
      return;
    }

    var self = this;

    this.model.set({
      cid: cid,
      aid: aid,
      tid: tid
    });
    this.model.addCATRelation({
      success: function() {
        self.model = new CATRelationModel();
        self.render();
        self.alert(true, 'Successfully added relation.');
      },
      error: function () {
        self.alert(false,
          'Oops! Something went wrong when saving this relation.');
      }
    });
  },

  addCATEnter: function(e) {
    if (e.keyCode == 13) this.addCAT(e);
  }

});

var FormsView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('forms'));
  },

  render: function() {
    $(this.el).addClass('row-fluid').html(this.template());
    return this;
  },

  populate: function() {

    // These populate forms for new entities
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
    if (!this.ccFormView) {
      var relation = new Relation({type: 1});
      this.ccFormView = new CCFormView({model: relation});
    }

    // These populate forms for new relations
    $('#new-cc-relation').append(this.ccFormView.render().el);
    if (!this.catFormView) {
      var catRelation = new CATRelationModel();
      this.catFormView = new CATFormView({model:catRelation});
    }
    $('#new-cat-relation').append(this.catFormView.render().el);

    // These populate the database lookup tables
    if (!this.countryTableView) {
      var countries = new CountryCollection();
      this.countryTableView = new EntityTableView({model: countries});
    }
    $('#entities .country-table').html(this.countryTableView.render().el);
    if (!this.agencyTableView) {
      var agencies = new AgencyCollection();
      this.agencyTableView = new EntityTableView({model: agencies});
    }
    $('#entities .agency-table').html(this.agencyTableView.render().el);
    if (!this.topicTableView) {
      var topics = new TopicCollection();
      this.topicTableView = new EntityTableView({model: topics});
    }
    $('#entities .topic-table').html(this.topicTableView.render().el);
  },

});
