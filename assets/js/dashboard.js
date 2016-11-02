'use strict';
/*global m */

var DashboardComponent = {
  controller: function () {
    var ctrl = this;
    ctrl.title = document.title = "Панель администратора";
  },
  view: function (ctrl) {
    return m("h1", ctrl.title);
  }
}

module.exports = DashboardComponent;
