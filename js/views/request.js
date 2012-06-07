var RequestView = FOIAView.extend({

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
    tabs: '<li><a data-target="#<%= div_id %>" data-toggle="tab"><%= agency %></a></li>'
  },

  render: function() {
    $(this.el).addClass('row-fluid').html(this.template(this.model.toJSON()));

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

    if ($('#new-request input.country').val().length == 0) {
      this.alert(false, 'Please, start by typing in a country name.');
      return;
    }

    var cid = this.countries.idForName($('#new-request input.country').val());
    if (cid == null) {
      this.alert(false, 'Invalid country name.');
      return;
    }

    this.model.set('country', cid);

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

    if ($('#new-request input.topic').val().length == 0) {
      this.alert(false, 'What is your request about?');
      return;
    }

    var self = this;

    var tid = this.topics.idForName($('#new-request input.topic').val());

    if (tid == null) {
      this.alert(false, 'Invalid topic.');
      return;
    }

    this.model.set('topic', tid);
    this.model.save(null, {
      success: function (model, response) {
        self.model.set('id', response.id);
        self.model.fetchSuggestions({
          success: function() {
            self.append_next(e, '#agency-template');
            _.each(self.model.get('suggestions'), self.build_tabs, self);
            $('#agency-tabs a:first').tab('show');
          },
          error: function() {
            self.alert(false,
              "Oops! Somethind went wrong while loading suggestions");
          }
        });
      },
      error: function (model, response) {
        self.alert(false, "Well, that wasn't supposed to happen...");
      }
    });

  },

  load_question: function(e) {
    e.preventDefault();

    if ($('#agencies :checkbox:checked').length == 0) {
      this.alert(false, 'Please select at least one agency.');
      return;
    }

    var self = this;
    this.model.setAgencies($('#agencies :checkbox:checked'),
      {
        success: function() {
          // nothing?
        },
        error: function() {
          self.alert(false,
            "Oops! Something went wrong while saving your selected agencies.");
        }
      }
    );
    this.append_next(e, '#question-template');
  },

  load_datepickers: function(e) {
    e.preventDefault();

    if ($('#new-request textarea').val().length == 0) {
      this.alert(false, 'What question would you like to ask?');
      return;
    }

    var self = this;

    this.model.set('question', $('#new-request textarea').val());
    this.model.save(null, {
      success: function (model, response) {
        self.append_next(e, '#date-doctype-template');
        var date_template = _.template($('#datepicker-template').html());
        $('span.date-container.start').html(date_template());
        $('span.date-container.end').html(date_template());

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
      },
      error: function (model, response) {
        self.alert(false, "Well, that wasn't supposed to happen...");
      }
    });
  },

  toggle_doctype: function(e) {
    e.preventDefault();
    $(e.target).attr('id');
  },

  get_date: function(str) {
    var year = $('span.date-container.' + str + ' select.year').val();
    var month = $('span.date-container.' + str + ' select.month').val();
    var day = $('span.date-container.' + str + ' select.day').val();
    return year + '-' + month + '-' + day;
  },

  generate_previews: function (prev) {
    _.each(prev.agencies, function (element, index, list) {
      var tab_template = _.template(this.partials.tabs);
      $('#request-preview ul').append(tab_template({
        div_id: index,
        agency: element
      }));

      var div_template = _.template(tpl.get('letters/us'));
      $('#request-preview .tab-content').append(div_template({
        div_id: index,
        agency_name: element,
        docs: prev.doctypes,
        question: prev.question
      }));
    }, this);
  },

  preview_request: function(e) {
    e.preventDefault();
    this.model.set('start', this.get_date('start'));
    this.model.set('end', this.get_date('end'));

    var self = this;
    this.model.setDoctypes($('.btn-group button.active'),
      {
        success: function() {
          // nothing?
        },
        error: function() {
          self.alert(false,
            "Oops! Something went wrong while saving your selected documents.");
        }
      }
    );

    this.model.save(null, {
      success: function(model, response) {
        self.model.fetchPreviews({
          success: function() {
            self.generate_previews(self.model.get('previews'));
            $('#request-preview .nav-tabs a:first').tab('show');
            $('#request-preview .tab-pane:first').addClass('active');
          },
          error: function() {
            self.alert(false,
              "Oops! Something went wrong while generating your requests...");
          }
        });
      },
      error: function(model, response) {
        self.alert(false, "Well, that wasn't supposed to happen...");
      }
    });
  }

});
