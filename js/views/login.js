var LoginView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('login'));
  },

  render: function() {
    $(this.el).html(this.template());
    return this
  }

});
