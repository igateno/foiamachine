var Entity = Backbone.Model.extend({

  url:'api/entities',

  defaults: {
    name: '',
    type: 0,
    type_string: ''
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
