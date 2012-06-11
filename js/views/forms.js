var CCTableView = FOIAView.extend({

  partials: {
    row: '<tr><td><%= name1 %></td><td>knows about</td><td><%= name2 %></td></tr>'
  },

  render: function() {
    if (!this.model) {
      this.alert(false, 'Error displaying the page.');
      return;
    }

    var self = this;
    this.model.fetch({
      success: function (model, response) {
        _.each(response, function (element, index, list) {
          var template = _.template(this.partials.row);
          $('#relations .cc tbody').append(template({
            name1: element.name1,
            name2: element.name2
          }));
        }, self);
      },
      error: function () {
        this.alert(false, 'Error displaying the page.');
      }
    });
  }

});

var CATTableView = FOIAView.extend({

  partials: {
    row: '<tr><td><%= country %></td><td><%= agency %></td><td><%= topic %></td></tr>'
  },

  render: function() {
    if (!this.model) {
      this.alert(false, 'Error displaying the page.');
      return;
    }

    var self = this;
    this.model.fetch({
      success: function (model, response) {
        _.each(response, function(element, index, list) {
          var template = _.template(this.partials.row);
          $('#relations .cat tbody').append(template({
            country: element.country,
            agency: element.agency,
            topic: element.topic
          }));
        }, self);
      },
      error: function() {
        this.alert(false, 'Error displaying the page.');
      }
    });
  }

});

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
            id: element.id,
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

var AgencyFormView = FOIAView.extend({

  initialize: function() {
    this.template = _.template($('#new-agency-template').html());
  },

  events: {
    'click #new-agency button': 'addAgency'
  },

  render: function() {
    $(this.el).html(this.template());

    var self = this;

    this.agencies = new AgencyCollection();
    this.agencies.fetch({
      success: function(model, response) {
        this.$('input.name').typeahead({
          source: model.nameArray()
        });
      },
      error: function() {
        self.alert(false, 'Error populating agencies.');
      }
    });

    this.countries = new CountryCollection();
    this.countries.fetch({
      success: function(model, response) {
        this.$('input.country').typeahead({
          source: model.nameArray()
        });
      },
      error: function() {
        self.alert(false, 'Error populating countries.');
      }
    });

    this.topics = new TopicCollection();
    this.topics.fetch({
      success: function(model, response) {
        this.$('input.topic').typeahead({
          source: model.nameArray()
        });
      },
      error: function() {
        self.alert(false, 'Error populating topics.');
      }
    });

    return this;
  },

  verifyAndExtractInput: function () {
    var results = {};

    if (this.$('input.name').val().length == 0) {
      this.alert(false, 'Agency name is a required field.');
      return null;
    }
    results.agency = this.$('input.name').val();
    if (this.agencies.idForName(results.agency)) {
      this.alert(false, 'This agency already exists in the database.');
      return;
    }
    if (this.$('input.country').val().length == 0) {
      this.alert(false, 'Agency country is a required field.');
      return null;
    }
    results.country = this.$('input.country').val();
    if (this.$('input.topic').val().length == 0) {
      this.alert(false, 'Agency topic is a required field.');
      return null;
    }
    results.topic = this.$('input.topic').val();
    if (this.$('input.contact').val().length == 0) {
      this.alert(false, 'Agency contact is a required field.');
      return null;
    }
    results.contact = this.$('input.contact').val();
    if (this.$('input.email').val().length == 0) {
      this.alert(false, 'Agency email is a required field.');
      return null;
    }
    results.email = this.$('input.email').val();

    return results;
  },

  // TODO when a new agency is added, it should also be added to the
  // typeaheads for the relation forms so that the page doesn't have
  // to reload
  addAgency: function(e) {
    e.preventDefault();

    var inputs = this.verifyAndExtractInput();
    if (!inputs) return;

    var self = this;

    var cid = this.countries.idForName(inputs.country);
    if (cid) {
      this.model.set('country_id', cid);
    } else {
      var cmodel = new Entity({
        name: inputs.country,
        type: 1
      });
      cmodel.save(null, {
        success: function(model, reponse) {
          self.model.set('country_id', response.id);
        },
        error: function() {
          self.alert(false, 'Error adding new country.');
        }
      });
    }

    var tid = this.topics.idForName(inputs.topic);
    if (tid) {
      this.model.set('topic_id', tid);
    } else {
      var tmodel = new Entity({
        name: inputs.topic,
        type: 3
      });
      tmodel.save(null, {
        success: function(model, response) {
          self.model.set('topic_id', response.id);
        },
        error: function() {
          self.alert(false, 'Error adding new topic.');
        }
      });
    }

    if (!this.model.get('country_id') || !this.model.get('topic_id')) {
      this.alert(false, 'Error adding a new country and topic');
      return;
    }

    this.model.save(
      {
        agency_name: inputs.agency,
        contact_name: inputs.contact,
        email: inputs.email,
      },
      {
        success: function(model, response) {
          self.model = new Agency();
          self.render();
          // TODO render all table views
          self.alert(true, 'Successfully added agency.');
        },
        error: function(model, response) {
          self.alert(false, 'Error adding agency.');
        }
      }
    );
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
        self.model = new CCRelation({type: type});
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
    if (!this.agencyFormView) {
      var agency = new Agency();
      this.agencyFormView = new AgencyFormView({model:agency});
    }
    $('#new-agency').append(this.agencyFormView.render().el);

    // These populate forms for new relations
    if (!this.ccFormView) {
      var relation = new CCRelation({type: 1});
      this.ccFormView = new CCFormView({model: relation});
    }
    $('#new-cc-relation').append(this.ccFormView.render().el);

    // These populate the database lookup tables for entities
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

    // These populate the database lookup tables for relations
    if (!this.ccTableView) {
      var ccCollection = new CCRelationCollection();
      this.ccTableView = new CCTableView({model: ccCollection});
    }
    this.ccTableView.render();
    if (!this.catTableView) {
      var catCollection = new CATCollection();
      this.catTableView = new CATTableView({model: catCollection});
    }
    this.catTableView.render();
  },

});
