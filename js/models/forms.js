var FoiaCollection = Backbone.Collection.extend({

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
  },

  idForName: function (name) {
    var country = _.find(this.models, function(model){
      return model.get('name') == name;
    }, this);
    if (typeof(country) == 'undefined') {
      return null;
    } else {
      return country.get('id');
    }
  }

});

/*
 * I haven't found a good way to enumerate the types of entity
 * in backbone but they are:
 * country 1
 * agency 2
 * topic 3
 * doctype 4
 */
var Entity = Backbone.Model.extend({

  urlRoot:'api/entities',

  defaults: function() {
    return {
      name: '',
      type: 0,
      username: $.cookie('username'),
      token: $.cookie('token')
    }
  },

});

var EntityCollection = Backbone.Collection.extend({

  model: Entity,

  url:"api/entities"

});

/*
 * Relation Types
 * knows about - 1
 * country-agency - 2
 * topic-agency - 3
 */
var Relation = Backbone.Model.extend({

  urlRoot:'api/relations',

  defaults: function() {
    return {
      id1: 0,
      id2: 0,
      type: 0,
      username: $.cookie('username'),
      token: $.cookie('token')
    }
  }

});

var RelationCollection = Backbone.Collection.extend({

  model: Relation,

  url:"api/relations"

});

var CountryCollection = FoiaCollection.extend({

  model: Entity.extend({type:1}),

  url: 'api/countries',

});

var AgencyCollection = FoiaCollection.extend({

  model: Entity.extend({type:2}),

  url: 'api/agencies',

});

var TopicCollection = FoiaCollection.extend({

  model: Entity.extend({type:3}),

  url: 'api/topics',

});

var DoctypeCollection = FoiaCollection.extend({

  model: Entity.extend({type:4}),

  url: 'api/doctypes',

});
