var RequestView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('request'));
  },

  events: {
    'click #request-countries a': 'tabs',
    'click #new-request input.btn': 'load_topics',
    'click form#request input#topicBtn': 'load_countries',
    'click form#request input#agencyBtn': 'load_question',
    'click form#request input#qBtn': 'load_datepickers'
  },

  render: function() {
    $(this.el).html(this.template());

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

    this.append_next(e, '#topic-template');

    this.topics = new TopicCollection();
    this.topics.fetch();
    $('#topic input').typeahead({
      source: this.topics.nameArray()
    });
  },

  load_countries: function(e) {
    e.preventDefault();
    this.append_next(e, 'request-partial-2');
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
