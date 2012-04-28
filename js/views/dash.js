var DashView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('dashboard'));
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  }

});
