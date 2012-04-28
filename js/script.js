/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'home',
    'dashboard':'dashboard'
  },

  initialize: function() {
    // TODO?
  },

  home: function() {
    if (!this.homeView) {
      this.homeView = new HomeView();
      this.homeView.render();
    }
    $('#content').html(this.homeView.el);
  },

  dashboard: function() {
    if (!this.dashView) {
      this.dashView = new DashView();
      this.dashView.render();
    }
    $('#content').html(this.dashView.el);
  }

});

var templates = ['hellofoia', 'dashboard'];
tpl.loadTemplates(templates, function() {
  app = new FOIARouter();
  Backbone.history.start();
});
