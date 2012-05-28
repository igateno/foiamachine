/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'login',
    'login':'login',
    'request':'request',
    'dash':'dashboard',
    'forms':'forms',
  },

  initialize: function() {
    this.headerView = new HeaderView();
    this.headerView.render();
    $('header').html(this.headerView.el);
  },

  assertAuth: function(callback) {
    if (!$.cookie('token')) {
      this.navigate('login', {trigger: true});
    } else {
      callback();
    }
  },

  login: function() {
    if (!this.loginView) {
      var session = new Session();
      this.loginView = new LoginView({model:session});
      this.loginView.render();
    }
    $('#container').html(this.loginView.el);
  },

  request: function() {
    this.assertAuth(function() {
      if (!this.requestView) {
        var request = new Request();
        this.requestView = new RequestView({model: request});
        this.requestView.render();
      }
      $('#container').html(this.requestView.el);
    });
  },

  dashboard: function() {
    this.assertAuth(function() {
      if (!this.dashView) {
        this.dashView = new DashView();
        this.dashView.render();
      }
      $('#container').html(this.dashView.el);
    });
  },

  forms: function(tab) {
    this.assertAuth(function() {
      if (!this.formsView) {
        this.formsView = new FormsView();
        this.formsView.render();
      }
      $('#container').html(this.formsView.el);
      this.formsView.populate();
    });
    /*this.elist = new EntityCollection();
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
    });*/
  }

});

var templates = [
  'header',
  'request',
  'agency-tab',
  'agency-div',
  'agency-checkbox',
  'request-partial-3',
  'request-partial-4',
  'dashboard',
  'login',
  'forms',
  'entity-item',
  'relation-item'
];
tpl.loadTemplates(templates, function() {
  app = new FOIARouter();
  Backbone.history.start();
});
