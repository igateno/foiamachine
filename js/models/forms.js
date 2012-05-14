var Entity = Backbone.Model.Extend({

  urlRoot: "api/entities"

});

var EntityCollection = Backbone.Collection.extend({

  model:Entity,

  url:"api/entities"

})l
