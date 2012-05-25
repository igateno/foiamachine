var Entity = Backbone.Model.extend({

  url:'api/entities',

  defaults: {
    name: '',
    type: 0,
    username: $.cookie('username'),
    token: $.cookie('token')
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

var Country = Entity.extend({

  initialize: function() {
    this.set({type: 1});
  }

});

var CountryCollection = Backbone.Collection.extend({

  model: Country,

  url: 'api/countries',

  nameArray: function () {
    this.result = [];
    var self = this;
    this.fetch({
      success: function() {
        _.each(self.models, function (element, index, list) {
          self.result.push(element.get('name'));
        }, self);
      }
    });
    return this.result;
  }

});
