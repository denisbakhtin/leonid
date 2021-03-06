﻿'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var Category = require("./category");
var Editor = require('../editor/editorcomponent');

var CategoryComponent = {};
CategoryComponent.vm = {};
CategoryComponent.vm.init = function() {
  var vm = this;
  vm.model = new Model({url: "/api/categories", type: Category});
  if (m.route.param("id") == "new") {
    vm.record = m.prop(new Category());
  } else {
    vm.record =  vm.model.get(m.route.param("id"));
  }
  return this;
}
CategoryComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = CategoryComponent.vm.init();
  if (m.route.param("id") == "new") {
    ctrl.updating = m.prop(false);
    ctrl.title = document.title = "Создание категории";
  } else {
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.record.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Карточка категории";
  }
  ctrl.error = m.prop('');
  ctrl.message = m.prop(''); //notifications

  ctrl.cancel = function() {
    m.route("/categories");
  }
  ctrl.update = function() {
    event.preventDefault();
    ctrl.updating(true);
    m.redraw();
    ctrl.message('');
    ctrl.error('');
    ctrl.vm.model.update(ctrl.vm.record())
      .then(
          function(success) {ctrl.message('Изменения успешно сохранены');},
          function(error) {ctrl.error(funcs.parseError(error));})
      .then(function() {ctrl.updating(false); m.redraw()});
  }
  ctrl.create = function() {
    event.preventDefault();
    ctrl.updating(true);
    m.redraw();
    ctrl.message('');
    ctrl.error('');
    ctrl.vm.model.create(ctrl.vm.record).then(
        function(success) {m.route("/categories")},
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        });
  }
}
CategoryComponent.view = function (ctrl) {

  return m("#categorycomponent",
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn',
        m('.form-group',
          m('label', 'Название'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})),
        m('.form-group',
          m('label', 'Описание'),
          m.component(Editor, {text: ctrl.vm.record().content})),
        m('.form-group',
          m('label', 'Мета описание'),
          m('input.form-control', {value: ctrl.vm.record().meta_description(), onchange: m.withAttr("value", ctrl.vm.record().meta_description)})),
        m('.form-group',
          m('label', 'Мета ключевики'),
          m('input.form-control', {value: ctrl.vm.record().meta_keywords(), onchange: m.withAttr("value", ctrl.vm.record().meta_keywords)})),
        m('.form-group',
          m('label', 'Опубликовать'),
          m('input[type=checkbox]', {checked: ctrl.vm.record().published(), onclick: m.withAttr("checked", ctrl.vm.record().published)})),
        (ctrl.message()) ? m('.action-message.animated.fadeInRight', ctrl.message()) : "",
        (ctrl.error()) ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "",
        m('.actions',
            (m.route.param("id") == "new")
            ? m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.create, disabled: ctrl.updating() },
              (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
              m('span', 'Создать'))
            : [
            m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.update, disabled: ctrl.updating() },
              (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
              m('span', 'Сохранить'))],
            m('button.btn.btn-danger', { onclick: ctrl.cancel },
              m('i.fa.fa-times'),
              m('span', 'Отмена'))))
          : m.component(Spinner, {standalone: true}));
}

module.exports = CategoryComponent;
