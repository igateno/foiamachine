var Entity = Backbone.Model.extend();

var EntityCollection = Backbone.Collection.extend({

  model: Entity,

  url:"api/entities"

});
