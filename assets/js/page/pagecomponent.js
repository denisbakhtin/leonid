﻿'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require('../helpers/model');
var Spinner = require('../layout/spinner');
var PageSizeSelector = require('../layout/pagesizeselector');
var Paginator = require('../layout/paginator');
var Page = require('./page');


var PageComponent = {};
PageComponent.vm = {};
PageComponent.vm.init = function() {
  var vm = this;
  vm.model = new Model({url: "/api/pages", type: Page});
  if (m.route.param("id") == "new") {
    vm.record = m.prop(new Page());
  } else {
    vm.record =  vm.model.get(m.route.param("id"));
  }
  return this;
}
PageComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = PageComponent.vm.init();
  if (m.route.param("id") == "new") {
    ctrl.updating = m.prop(false);
    ctrl.title = document.title = "Создание страницы";
  } else {
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.record.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Карточка страницы";
  }
  ctrl.error = m.prop('');
  ctrl.message = m.prop(''); //notifications

  ctrl.cancel = function() {
    m.route("/pages");
  }
  ctrl.update = function() {
    event.preventDefault();
    ctrl.updating(true);
    m.redraw();
    ctrl.message('');
    ctrl.error('');
    ctrl.vm.model.update(ctrl.vm.record)
      .then(
          function(success) {ctrl.message('Изменения успешно сохранены');},
          function(error) {ctrl.error(parseError(error));}
          ).then(function() {ctrl.updating(false); m.redraw()});
  }
  ctrl.create = function() {
    event.preventDefault();
    ctrl.updating(true);
    m.redraw();
    ctrl.message('');
    ctrl.error('');
    ctrl.vm.model.create(ctrl.vm.record).then(
        function(success) {m.route("/pages");},
        function(error) {
          ctrl.error(parseError(error));
          ctrl.updating(false); 
          m.redraw();
        }
        );
  }
}
PageComponent.view = function (ctrl) {

  //complete view
  return m("#pagecomponent", [
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn', [
        m('.form-group', [
          m('label', 'Заголовок'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})
        ]),
        m('.form-group', [
          m('label', 'Короткий адрес'),
          m('input.form-control', {value: ctrl.vm.record().slug(), onchange: m.withAttr("value", ctrl.vm.record().slug)})
        ]),
        m('.form-group', [
          m('label', 'Содержание'),
          m('textarea.form-control', {value: ctrl.vm.record().content(), onchange: m.withAttr("value", ctrl.vm.record().content)})
        ]),
        m('.form-group', [
          m('label', 'Опубликовать'),
          m('input[type=checkbox]', {checked: ctrl.vm.record().published(), onclick: m.withAttr("value", ctrl.vm.record().published)})
        ]),
        (ctrl.message()) ? m('.action-message.animated.fadeInRight', ctrl.message()) : "",
        (ctrl.error()) ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "",
        m('.actions', [
          (m.route.param("id") == "new")
          ? m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.create, disabled: ctrl.updating() }, [
            (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
            m('span', 'Создать')
          ])
          : [
          m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.update, disabled: ctrl.updating() }, [
            (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
            m('span', 'Сохранить')
          ]),
          ],
          m('button.btn.btn-warning', { onclick: ctrl.cancel }, [
            m('i.fa.fa-chevron-left'),
            m('span', 'Отмена')
          ])
        ])
      ])
      : m.component(Spinner, {standalone: true})
    ])
}

module.exports = PageComponent;
