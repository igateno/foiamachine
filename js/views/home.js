var HomeView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('hellofoia'));
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  }

});
