var RequestView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('request'));
  },

  events: {
    'click #request-countries a': 'tabs',
    'click #new-request input.btn': 'load_topics',
    'click #new-request input#topicBtn': 'load_countries',
    'click #new-request input#agencyBtn': 'load_question',
    'click #new-request input#qBtn': 'load_datepickers'
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

    this.model.set('country', $('#new-request input.country').val());

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

  load_countries: function(e) {
    e.preventDefault();

    if ($('#new-request input.topic').val().length == 0) return;

    var self = this;

    this.model.set('topic', $('#new-request input.topic').val());
    this.model.fetchTabs(function() {
      self.append_next(e, '#agency-template');
      _.each(self.model.get('suggestions'), self.build_tabs, self);
    });
  },

  load_question: function(e) {
    e.preventDefault();
    this.model.saveAgencies($('#agencies :checkbox:checked'));
    this.append_next(e, '#question-template');
  },

  load_datepickers: function(e) {
    e.preventDefault();
    this.append_next(e, '#datepicker-template');
    $('.datepicker').datepicker();
    $('.btn').button();
  }

});
