var Entity = Backbone.Model.extend({

  urlRoot: "api/entities",

  initialize: function() {
    console.log("initializing model: Entity");
  }

});

var EntityCollection = Backbone.Collection.extend({

  model: Entity,

  url:"api/entities",

  initialize: function() {
    console.log("initializing model: EntityCollection");
  }

});
