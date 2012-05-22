/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'login',
    'request':'request',
    'dash':'dashboard',
    'forms':'countryForm',
  },

  initialize: function() {
    this.headerView = new HeaderView();
    this.headerView.render();
    $('header').html(this.headerView.el);
  },

  loadView: function(view) {
    view.render();
    $('#container').html(view.el);
  },

  login: function() {
    if (!this.loginView) {
      this.loginView = new LoginView();
      this.loginView.render();
    }
    $('#container').html(this.loginView.el);
  },

  request: function() {
    if (!this.requestView) {
      this.requestView = new RequestView();
      this.requestView.render();
    }
    $('#container').html(this.requestView.el);
  },

  dashboard: function() {
    if (!this.dashView) {
      this.dashView = new DashView();
      this.dashView.render();
    }
    $('#container').html(this.dashView.el);
  },

  countryForm: function() {
    if (!this.countryFormView) {
      var country = new Entity();
      this.countryFormView = new CountryFormView({model:country});
      this.countryFormView.render();
    }
    $('#container').html(this.countryFormView.el);
  },

  forms: function(tab) {
    if (!this.formsView) {
      this.formsView = new FormsView();
      this.formsView.render();
    }
    $('#container').html(this.formsView.el);
    this.elist = new EntityCollection();
    this.elist.fetch({
      success: function(collection) {
        var elistView = new EntityListView({model: collection});
        $('#entity-list').html(elistView.render().el);
      }
    });
    this.rlist = new RelationCollection();
    this.rlist.fetch({
      success: function(collection) {
        var rlistView = new RelationListView({model: collection});
        $('#relation-list').html(rlistView.render().el);
      }
    });
  }

});

var templates = [
  'header',
  'request',
  'request-partial-1',
  'request-partial-2',
  'request-partial-3',
  'request-partial-4',
  'dashboard',
  'login',
  'forms',
  'country-form',
  'entity-item',
  'relation-item'
];
tpl.loadTemplates(templates, function() {
  app = new FOIARouter();
  Backbone.history.start();
});
