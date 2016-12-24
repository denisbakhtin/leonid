'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var CategorySelect = require("../category/categoryselect");
var Product = require("./product");
var Editor = require('../editor/editorcomponent');
var ImagesComponent = require('../image/imagescomponent');

var ProductComponent = {};
ProductComponent.vm = {};
ProductComponent.vm.init = function() {
  var vm = this;
  vm.model = new Model({url: "/api/products", type: Product});
  if (m.route.param("id") == "new") {
    vm.record = m.prop(new Product());
  } else {
    vm.record =  vm.model.get(m.route.param("id"));
  }
  return this;
}
ProductComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = ProductComponent.vm.init();
  if (m.route.param("id") == "new") {
    ctrl.updating = m.prop(false);
    ctrl.title = document.title = "Создание товара";
  } else {
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.record.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Карточка товара";
  }
  ctrl.error = m.prop('');
  ctrl.message = m.prop(''); //notifications

  ctrl.cancel = function() {
    m.route("/products");
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
        function(success) {m.route("/products");},
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        });
  }
}
ProductComponent.view = function (ctrl) {

  //complete view
  return m("#productcomponent",
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn',
        m('.form-group',
          m('label', 'Название'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})),
        m('.row',
          m('.form-group col-sm-6',
            m('label', 'Категория'),
            m.component(CategorySelect, {value: ctrl.vm.record().category_id, error: ctrl.error})),
          m('.form-group col-sm-6',
            m('label', 'Цена'),
            m('.input-group',
              m('input.form-control[type=number][step=0.01]', {value: ctrl.vm.record().price(), onchange: m.withAttr("value", ctrl.vm.record().price)}),
              m('span.input-group-addon', 'р.')))),
        m('.form-group',
          m('label', 'Содержание'),
          m.component(Editor, {text: ctrl.vm.record().content})),
        m('.form-group.outline',
          m('label', 'Фотографии'),
          m.component(ImagesComponent, ctrl.vm.record().images)),
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
              m('span', 'Сохранить')
             )],
            m('button.btn.btn-danger', { onclick: ctrl.cancel },
              m('i.fa.fa-times'),
              m('span', 'Отмена'))))
      : m.component(Spinner, {standalone: true}));
}

module.exports = ProductComponent;
