/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'home'
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
  }

});

var templates = ['hellofoia'];
tpl.loadTemplates(templates, function() {
  app = new FOIARouter();
  Backbone.history.start();
});
