var FormsView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('forms'));
  },

  events: {
    "click #feedback a": "tabs"
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  tabs: function(e) {
    e.preventDefault();
    $(this).tab('show');
  }

});
