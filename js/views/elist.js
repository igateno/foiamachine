var EntityListView = Backbone.View.extend({

  render: function() {
    var f = function() {
      var item = new EntityItemView({model:Entity});
      item.render();
      $(this.el).append(item.el);
    };
    _.each(this.model.models, f, this);
    return this;
  }

});

var EntityItemView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('entity-item'));
  },

  render: function() {
    $(this.el).html(this.model.toJSON());
  }

});
