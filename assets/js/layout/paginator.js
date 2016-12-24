'use strict';

var pages = require('../helpers/funcs').pages;
var Paginator = {};

Paginator.controller = function(args) {
  var ctrl = this;
  ctrl.setpage = function(index) {
    args.onsetpage(index);
    return false;
  }
}

Paginator.view = function(ctrl, args) {
  return m('#paginator', 
      (args.list().length > args.pagesize())
      ? m('nav',
        m('ul.pagination', 
          pages(args.list().length, args.pagesize())
          .map(function(p, index){
            return m('li', {class: (index == args.currentpage()) ? 'active' : ''}, 
                (index == args.currentpage())
                ? m('span', index+1)
                : m('a[href=/]', {onclick: ctrl.setpage.bind(this, index)}, index+1)
                )
          })))
      : "");
}

module.exports = Paginator;
