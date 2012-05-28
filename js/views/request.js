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
    var div_id = index.replace(' ', '_');

    var tabTemplate = _.template(tpl.get('agency-tab'));
    $('#agency-tabs ul').append(tabTemplate({
      div_id: div_id,
      country: index
    }));

    var divTemplate = _.template(tpl.get('agency-div'));
    $('#agencies').append(divTemplate({
      div_id: div_id
    }));

    _.each(element, function(elem, i, l) {
      var cboxTemplate = _.template(tpl.get('agency-checkbox'));
      console.log(elem);
      $('#' + div_id + ' ul').append(cboxTemplate({
        country: elem
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
      _.each(self.model.get('agencies'), self.build_tabs, self);
    });
  },

  load_question: function(e) {
    e.preventDefault();
    this.append_next(e, 'request-partial-3');
  },

  load_datepickers: function(e) {
    e.preventDefault();
    this.append_next(e, 'request-partial-4');
    $('.datepicker').datepicker();
    $('.btn').button();
  }

});
