var Entity = Backbone.Model.extend({

  urlRoot: "api/entities"

});

var EntityCollection = Backbone.Collection.extend({

  model:Entity,

  url:"api/entities"

});
