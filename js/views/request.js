var RequestView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('request'));
  },

  events: {
    'click #request-countries a': 'tabs',
    'click #new-request input.btn': 'load_topics',
    'click #new-request input#topicBtn': 'load_tabs',
    'click #new-request input#agencyBtn': 'load_question',
    'click #new-request input#qBtn': 'load_datepickers',
    'click #new-request input#dateBtn': 'preview_request',
    'click .doctypes button': 'toggle_doctype'
  },

  partials: {
    doc_buttons: '<button id="<%= id %>" class="btn"><%= name %></button>',
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));

    this.countries = new CountryCollection();
    this.countries.fetch();
    this.$('#new-request input.country').typeahead({
      source: this.countries.nameArray()
    });

    return this;
  },

  tabs: function(e) {
    e.preventDefault();
    $(this).tab('show');
  },

  append_next: function(e, selector) {
    $(e.target).detach();
    var template = _.template($(selector).html());
    $('#new-request form fieldset').append(template);
  },

  load_topics: function(e) {
    e.preventDefault();

    if ($('#new-request input.country').val().length == 0) return;

    var cname = $('#new-request input.country').val();
    this.model.set('country', this.countries.idForName(cname));

    this.append_next(e, '#topic-template');

    this.topics = new TopicCollection();
    this.topics.fetch();
    $('#topic input').typeahead({
      source: this.topics.nameArray()
    });
  },

  build_tabs: function(element, index, list) {
    var tabTemplate = _.template(tpl.get('agency-tab'));
    $('#agency-tabs ul').append(tabTemplate({
      div_id: index,
      country: element.name
    }));

    var divTemplate = _.template(tpl.get('agency-div'));
    $('#agencies').append(divTemplate({
      div_id: index
    }));

    _.each(element.agencies, function(elem, i, l) {
      var cboxTemplate = _.template(tpl.get('agency-checkbox'));
      $('#' + index + ' ul').append(cboxTemplate({
        agency: elem,
        id: i
      }));
    }, this);
  },

  load_tabs: function(e) {
    e.preventDefault();

    if ($('#new-request input.topic').val().length == 0) return;

    var self = this;

    var tname = $('#new-request input.topic').val();
    this.model.set('topic', this.topics.idForName(tname));
    this.model.save(null, {
      success: function (model, response) {
        self.model.set('id', response.id);
        self.model.fetchTabs(function() {
          self.append_next(e, '#agency-template');
          _.each(self.model.get('suggestions'), self.build_tabs, self);
        });
      },
      error: function (model, response) {
        // TODO
      }
    });

  },

  load_question: function(e) {
    e.preventDefault();
    this.model.setAgencies($('#agencies :checkbox:checked'));
    this.append_next(e, '#question-template');
  },

  load_datepickers: function(e) {
    e.preventDefault();

    if ($('#new-request textarea').val().length == 0) return;

    var self = this;

    this.model.set('question', $('#new-request textarea').val());
    this.model.save(null, {
      success: function (model, response) {
        self.append_next(e, '#datepicker-template');

        var docTemplate = _.template(self.partials.doc_buttons);
        self.doctypes = new DoctypeCollection();
        self.doctypes.fetch({
          success: function(collection) {
            _.each(collection.models, function(element, index, list) {
              $('#new-request .doctypes').append(docTemplate({
                id: element.get('id'),
                name: element.get('name')
              }));
            }, self);
          }
        });

        $('.datepicker').datepicker();
      },
      error: function (model, response) {
        // TODO
      }
    });
  },

  toggle_doctype: function(e) {
    e.preventDefault();
    $(e.target).attr('id');
  },

  preview_request: function(e) {
    e.preventDefault();
    this.model.set('start', $('#new-request input.start').val());
    this.model.set('end', $('#new-request input.end').val());

    this.model.setDoctypes($('.btn-group button.active'));
    this.model.save(null, {
      success: function (model, response) {
        // TODO display preview of request on page?
        console.log('yeah, baby!');
      },
      error: function (model, response) {
        // TODO
      }
    });
  }

});
