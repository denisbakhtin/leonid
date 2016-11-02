'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var Category = require("./categorygrid");
var CategorySelect = require("./categoryselect");
var Product = require("./product");

var ProductPage = {};
ProductPage.vm = {};
ProductPage.vm.init = function() {
  var vm = this;
  vm.model = new Model({url: "/api/products", type: Product});
  vm.record =  vm.model.get(m.route.param("id"));
  return this;
}
ProductPage.controller = function () {
  var ctrl = this;

  ctrl.vm = ProductPage.vm.init();
  ctrl.updating = m.prop(true); //waiting for data update in background
  ctrl.vm.record.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
  ctrl.title = document.title = (m.route.param("id") == "new") ? "Создание нового товара" : "Карточка товара";
  ctrl.error = m.prop('');
  ctrl.message = m.prop(''); //notifications

  ctrl.update = function() {
    ctrl.updating(true);
    m.redraw();
    ctrl.vm.model.update(ctrl.vm.record)
      .then(
          function(success) { ctrl.message('Изменения успешно сохранены');},
          function(error) { ctrl.error(funcs.parseError(error))}
          ).then(function() {ctrl.updating(false); m.redraw()})
  }
  ctrl.create = function() {
    ctrl.updating(true);
    m.redraw();
    ctrl.vm.model.create(ctrl.vm.record).then(
        function(success) { m.route("/products");},
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        }
        );
  }
  ctrl.delete = function() {
    ctrl.updating(true);
    ctrl.vm.model.delete(ctrl.vm.record.id()).then(
        function(success) { m.route("/products");},
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false);
          m.redraw();
        }
        );
  }
}
ProductPage.view = function (ctrl) {

  //complete view
  return m("#categorylist", [
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn', [
        m('.form-group', [
          labelfor('name', ctrl.vm.record),
          inputfor('name', ctrl.vm.record)
        ]),
        m('.form-group', [
          labelfor('image', ctrl.vm.record),
          inputfor('image', ctrl.vm.record) //filefor
        ]),
        m('.form-group', [
          labelfor('categoryid', ctrl.vm.record),
          m.component(CategorySelect, {value: ctrl.vm.record().categoryid, error: ctrl.error})
        ]),
        m('.form-group', [
          labelfor('ispublished', ctrl.vm.record),
          inputfor('ispublished', ctrl.vm.record) //checkboxfor
        ]),
        m('.form-group', [
          labelfor('price', ctrl.vm.record),
          inputfor('price', ctrl.vm.record)
        ]),
        m('.form-group', [
            labelfor('description', ctrl.vm.record),
            inputfor('description', ctrl.vm.record) //textareafor
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
            m('button.btn.btn-danger', { onclick: ctrl.delete, disabled: ctrl.updating() }, [
              m('i.fa.fa-remove'),
              m('span', 'Удалить')
            ]),
            ]
        ])
          ])
          : m.component(Spinner, {standalone: true})
          ]);
}

module.exports = ProductComponent;
