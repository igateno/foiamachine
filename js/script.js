/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'login',
    'login':'login',
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
  }

});

var templates = [
  'header',
  'request-carousel',
  'letters/us',
  'letters/serbia-english',
  'agency-tab',
  'agency-div',
  'agency-checkbox',
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
