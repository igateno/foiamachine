/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'home',
    'login':'login',
    'dash':'dashboard',
    'forms':'forms',
  },

  initialize: function() {
    this.headerView = new HeaderView();
    this.headerView.render();
    $('header').html(this.headerView.el);
  },

  login: function() {
    if (!this.loginView) {
      this.loginView = new LoginView();
      this.loginView.render();
    }
    $('article').html(this.loginView.el);
  },

  home: function() {
    if (!this.homeView) {
      this.homeView = new HomeView();
      this.homeView.render();
    }
    $('article').html(this.homeView.el);
  },

  dashboard: function() {
    if (!this.dashView) {
      this.dashView = new DashView();
      this.dashView.render();
    }
    $('article').html(this.dashView.el);
  },

  forms: function(tab) {
    if (!this.formsView) {
      this.formsView = new FormsView();
      this.formsView.render();
    }
    $('article').html(this.formsView.el);
  }

});

var templates = ['header', 'hellofoia', 'dashboard', 'login', 'forms'];
tpl.loadTemplates(templates, function() {
  app = new FOIARouter();
  Backbone.history.start();
});
