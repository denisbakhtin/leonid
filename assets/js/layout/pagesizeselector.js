'use strict';

var setCookie = require("../helpers/funcs").setCookie;

var PageSizeSelector = {};

//arg is an m.prop of pagesize in the parent controller
PageSizeSelector.controller = function(arg) {
  var ctrl = this;
  ctrl.setpagesize = function(size) {
    arg(size);
    setCookie("pagesize", size, 365); //store pagesize in cookies
    m.redraw();
    return false;
  };
}

PageSizeSelector.view = function(ctrl, arg) {
  return m('#pagesizeselector', [
      m('span', "Показывать на странице: "),
      [10, 50, 100, 500].map(function(size) {
        return m('a[href=#]', {class: (size == arg()) ? 'active' : '', onclick: ctrl.setpagesize.bind(this, size)}, size)
      })
  ]);
}

module.exports = PageSizeSelector;
