var RequestView = FOIAView.extend({

  initialize: function() {
    this.template = _.template(tpl.get('request-carousel'));
  },

  events: {
    'click #request-countries a': 'tabs',
    'click #new-request input#topicBtn': 'load_tabs',
    'click #new-request input#agencyBtn': 'load_question',
    'click #new-request input#qBtn': 'load_datepickers',
    'click #new-request input#dateNext': 'save_date',
    'click #new-request input#dateSkip': 'skip_date',
    'click #new-request input#docsNext': 'save_docs',
    'click #new-request input#docsSkip': 'skip_docs'
  },

  partials: {
    doc_li: '<li><input id="<%= id %>" type="checkbox"><%= name %></input></li>',
    tabs: '<li><a data-target="#<%= div_id %>" data-toggle="tab"><%= agency %></a></li>'
  },

  render: function() {
    $(this.el).addClass('row-fluid').html(this.template(this.model.toJSON()));

    var self = this;

    this.topics = new TopicCollection();
    this.topics.fetch({
      success: function (model, response) {
        $('#topic input.topic').typeahead({
          source: self.topics.nameArray()
        });
      },
      error: function() {
        self.alert(false, 'There was an error loading the topics.');
      }
    });

    this.$('#request-carousel').carousel({interval: 0});

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

    var tname = $('#new-request input.topic').val();
    if (tname.length == 0) {
      this.alert(false, 'What is your request about?');
      return;
    }

    var self = this;

    var tid = this.topics.idForName(tname);

    if (tid == null) {
      this.alert(false, 'Invalid topic.');
      return;
    }

    this.model.set({topic: tid, topic_name: tname});
    this.model.fetchSuggestions({
      success: function() {
        var template = _.template($('#agency-template').html());
        $('#suggestions').html(template());
        _.each(self.model.get('suggestions'), self.build_tabs, self);
        $('#agency-tabs a:first').tab('show');
        $('#request-carousel').carousel('next');
      },
      error: function() {
        self.alert(false,
          "Oops! Somethind went wrong while loading suggestions");
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
    this.model.setCheckboxes($('#agencies :checkbox:checked'), 'agency_ids');

    var template = _.template($('#question-template').html());
    $('#question').html(template());
    $('#request-carousel').carousel('next');
  },

  load_datepickers: function(e) {
    e.preventDefault();

    if ($('#new-request textarea').val().length == 0) {
      this.alert(false, 'What question would you like to ask?');
      return;
    }

    var self = this;

    this.model.set('question', $('#new-request textarea').val());

    var template = _.template($('#date-template').html());
    $('#date').html(template());
    var date_template = _.template($('#datepicker-template').html());
    $('span.date-container.start').html(date_template());
    $('span.date-container.end').html(date_template());
    $('#request-carousel').carousel('next');
  },

  get_date: function(str) {
    var year = $('span.date-container.' + str + ' select.year').val();
    var month = $('span.date-container.' + str + ' select.month').val();
    var day = $('span.date-container.' + str + ' select.day').val();
    return year + '-' + month + '-' + day;
  },

  save_date: function(e) {
    e.preventDefault();

    this.model.set('start', this.get_date('start'));
    this.model.set('end', this.get_date('end'));

    this.render_doctypes(e);
  },

  skip_date: function(e) {
    e.preventDefault();
    this.render_doctypes(e);
  },

  render_doctypes: function(e) {
    var template = _.template($('#doctypes-template').html());
    $('#doctypes').html(template());

    var self = this;

    var docTemplate = _.template(self.partials.doc_li);
    this.doctypes = new DoctypeCollection();
    this.doctypes.fetch({
      success: function(collection) {
        _.each(collection.models, function(element, index, list) {
          $('#doctypes ul').append(docTemplate({
            id: element.get('id'),
            name: element.get('name')
          }));
        }, self);
      }
    });

    $('#request-carousel').carousel('next');
  },

  save_docs: function(e) {
    e.preventDefault();
    this.model.setCheckboxes($('.btn-group button.active'), 'doctype_ids');
    this.load_registration();
  },

  skip_docs: function(e) {
    e.preventDefault();
    this.load_registration();
  },

  load_registration: function() {
    $('#register-modal').modal('show');
    // register the user
    // save the model
    // preview the request
  },

  generate_previews: function (prev) {
    _.each(prev.agencies, function (element, index, list) {
      var tab_template = _.template(this.partials.tabs);
      $('#request-preview ul').append(tab_template({
        div_id: 'prev'+index,
        agency: element.agency_name
      }));

      var tplname = element.template || 'us';
      var div_template = _.template(tpl.get('letters/' + tplname));
      $('#request-preview .tab-content').append(div_template({
        div_id: 'prev'+index,
        agency_name: element.agency_name,
        contact_name: element.contact_name,
        docs: prev.doctypes,
        question: prev.question,
        start_date: prev.start_date,
        end_date: prev.end_date,
        created: prev.created
      }));
    }, this);
  },

  preview_request: function(e) {
    var self = this;

    this.model.fetchPreviews({
      success: function() {
        self.generate_previews(self.model.get('previews'));
        $('#request-preview .nav-tabs a:first').tab('show');
      },
      error: function() {
        self.alert(false,
          "Oops! Something went wrong while generating your requests...");
      }
    });
  },

});
