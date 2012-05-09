var RequestView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('request'));
  },

  events: {
    'click form#country input#goBtn': 'goBtn'
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  goBtn: function(e) {
    e.preventDefault();
    $('form#country fieldset').append('<div>Hello, world!</div>');
    $(e.target).detach();
  }

});
