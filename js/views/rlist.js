var RelationListView = Backbone.View.extend({

  render: function() {
    _.each(this.model.models, function(element, index, list) {
      var item = new RelationItemView({model:element});
      item.render();
      $(this.el).append(item.el);
    }, this);
    return this;
  }

});

var RelationItemView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template(tpl.get('relation-item'));
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }

});
