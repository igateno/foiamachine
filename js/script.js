/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'login',
    'request':'request',
    'dash':'dashboard',
    'forms':'forms',
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

  forms: function(tab) {
    if (!this.formsView) {
      this.formsView = new FormsView();
      this.formsView.render();
    }
    $('#container').html(this.formsView.el);
  }

});

var templates = ['header', 'request', 'dashboard', 'login', 'forms'];
tpl.loadTemplates(templates, function() {
  app = new FOIARouter();
  Backbone.history.start();
});
