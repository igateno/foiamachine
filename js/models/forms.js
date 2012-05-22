var Entity = Backbone.Model.extend({

  url:'api/entities',

  initialize: function() {
    console.log('new entity model created');
  },

  defaults: {
    name: '',
    type: 0
  }

});

var EntityCollection = Backbone.Collection.extend({

  model: Entity,

  url:"api/entities"

});

var Relation = Backbone.Model.extend();

var RelationCollection = Backbone.Collection.extend({

  model: Relation,

  url:"api/relations"

});
