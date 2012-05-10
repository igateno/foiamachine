var RequestView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('request'));
  },

  events: {
    'click #request-countries a': 'tabs',
    'click form#request input.btn': 'load_topics',
    'click form#request input#topicBtn': 'load_countries',
    'click form#request input#agencyBtn': 'load_question',
    'click form#request input#qBtn': 'load_datepickers'
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  tabs: function(e) {
    e.preventDefault();
    $(this).tab('show');
  },

  append_next: function(e, tpl_key) {
    $(e.target).detach();
    var template = _.template(tpl.get(tpl_key));
    $('form#request fieldset').append(template);
  },

  load_topics: function(e) {
    e.preventDefault();
    // should check for input and fire an alert if no input
    this.append_next(e, 'request-partial-1');
    $('form#country #topic input').typeahead({
      'source': ['Drug War', 'Immigration', 'Sombreros']
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
