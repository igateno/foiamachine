var EntityListView = Backbone.View.extend({

  render: function() {
    _.each(this.model.models, function(element, index, list) {
      var item = new EntityItemView({model:element});
      item.render();
      $(this.el).append(item.el);
    }, this);
    return this;
  }

});

var EntityItemView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('entity-item'));
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }

});
