/* This is the main Backbone script for the application */

var FOIARouter = Backbone.Router.extend({

  routes: {
    '':'login',
    'login':'login',
    'dash':'dashboard',
    'request/:id':'viewRequest'
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
      var dashModel = new DashModel();
      this.dashView = new DashView({model: dashModel});
      this.dashView.render();
      $('#container').html(this.dashView.el);
    });
  },

  viewRequest: function (id) {
    this.assertAuth(function() {
      var viewRequestModel = new ViewRequestModel({id: id});
      this.viewRequestView = new ViewRequestView({model: viewRequestModel});
      this.viewRequestView.render();
      $('#container').html(this.viewRequestView.el);
    });
  }

});

var templates = [
  'header',
  'request-carousel',
  'view_request',
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
