var FOIAView = Backbone.View.extend({

  alert: function(success, message) {
    var alertView = new Backbone.View();
    alertView.template = _.template($('#alert-template').html());
    $(alertView.el).html(alertView.template());

    if (success) {
      alertView.$('.alert').addClass('alert-success');
    } else {
      alertView.$('.alert').addClass('alert-error');
    }
    alertView.$('.message').html(message);

    $('#alert-container').html(alertView.el);
  }

});
