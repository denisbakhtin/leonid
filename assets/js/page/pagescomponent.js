'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var Page = require("./page");

var PagesComponent = {};
PagesComponent.vm = {};
PagesComponent.vm.init = function(args) {
  args = args || {};
  var vm = this;
  vm.model = new Model({url: "/api/pages", type: Page});
  vm.list = vm.model.index();
  return this;
}
PagesComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = PagesComponent.vm.init();
  ctrl.updating = m.prop(true); //waiting for data update in background
  ctrl.vm.list.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
  ctrl.title = document.title = "Список страниц";
  ctrl.pagesize = m.prop(funcs.getCookie("pagesize") || 10); //number of items per page
  ctrl.currentpage = m.prop(0); //current page, starting with 0
  ctrl.error = m.prop('');

  ctrl.edit = function(row) {
    m.route("/pages/"+row.id());
  }
  ctrl.create = function(row) {
    m.route("/pages/new");
  }
  ctrl.show = function(row) {
    event.stopPropagation(); //prevent tr.onclick trigger
    window.location = "/page/" + row.id() + "-" + row.slug();
  }
  ctrl.delete = function(row) {
    ctrl.updating(true);
    event.stopPropagation(); //prevent tr.onclick trigger
    ctrl.vm.model.delete(row.id()).then(
        function(success) {
          ctrl.vm.list = ctrl.vm.model.index();
          ctrl.vm.list.then(function(){
            if (ctrl.currentpage()+1 > funcs.pages(ctrl.vm.list().length, ctrl.pagesize()).length) {
              ctrl.currentpage(Math.max(ctrl.currentpage()-1, 0));
            }
            ctrl.updating(false);
            m.redraw();
          })
        },
        function(error) {
          ctrl.updating(false);
          m.redraw();
        }
        );
  }
}
PagesComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        m('td', data.name()),
        m('td.shrink', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-default[title=Просмотр]', {onclick: ctrl.show.bind(this, data)}, m('i.fa.fa-eye')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
         ));
  } //showRowTemplate

  //complete view
  return m("#pagescomponent",
      m("h1", ctrl.title),
      m('div',
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()),
          m('thead', 
            m('tr',
              m('th.clickable[data-sort-by=name]', 'Заголовок'),
              m('th.shrink.clickable[data-sort-by=published]', 'Опубликовано'),
              m('th.shrink.actions', '#'))),
          m('tbody', 
            ctrl.vm.list()
            ? [
            ctrl.vm.list()
            .slice(ctrl.currentpage()*ctrl.pagesize(), (ctrl.currentpage()+1)*ctrl.pagesize())
            .map(function(data){
              return showRowTemplate(data)
            }),
            (!ctrl.vm.list().length) 
            ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.'))
            : "",
            ctrl.updating() ? m.component(Spinner) : ""
            ]
            : m.component(Spinner)
           )),
          m('.actions',
              m('button.btn.btn-primary', { onclick: ctrl.create },
                m('i.fa.fa-plus'),
                m('span', 'Добавить страницу')),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : ""));
}

module.exports = PagesComponent;
