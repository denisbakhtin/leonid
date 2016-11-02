'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var User = require('./user');

var UserComponent = {};
UserComponent.vm = {};
UserComponent.vm.init = function() {
  var vm = this;
  vm.model = new Model({url: "/api/users", type: User});
  if (m.route.param("id") == "new") {
    vm.record = m.prop(new User());
  } else {
    vm.record =  vm.model.get(m.route.param("id"));
  }
  return this;
}
UserComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = UserComponent.vm.init();
  if (m.route.param("id") == "new") {
    ctrl.updating = m.prop(false);
    ctrl.title = document.title = "Создание пользователя";
  } else {
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.record.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Карточка пользователя";
  }
  ctrl.error = m.prop('');
  ctrl.message = m.prop(''); //notifications

  ctrl.cancel = function() {
    m.route("/users");
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
        function(success) { m.route("/users");},
        function(error) {
          ctrl.error(parseError(error));
          ctrl.updating(false); 
          m.redraw();
        }
        );
  }
}
UserComponent.view = function (ctrl) {

  //complete view
  return m("#user", [
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn', [
        m('.form-group', [
          m('label', 'Имя'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})
        ]),
        m('.form-group', [
          m('label', 'Эл. почта'),
          m('input.form-control[type=email]', {value: ctrl.vm.record().email(), onchange: m.withAttr("value", ctrl.vm.record().email)})
        ]),
        (m.route.param("id") != "new")
        ? m('.form-group', [
          m('label', 'Текущий пароль'),
          m('input.form-control[type=password]', {placeholder: "Оставьте пустым, чтобы сохранить текущий пароль", value: ctrl.vm.record().current_password(), onchange: m.withAttr("value", ctrl.vm.record().current_password)})
        ])
        : "",
        m('.form-group', [
          m('label', 'Новый пароль'),
          m('input.form-control[type=password]', {placeholder: "Оставьте пустым, чтобы сохранить текущий пароль", value: ctrl.vm.record().password(), onchange: m.withAttr("value", ctrl.vm.record().password)})
        ]),
        m('.form-group', [
          m('label', 'Подтверждение пароля'),
          m('input.form-control[type=password]', {placeholder: "Оставьте пустым, чтобы сохранить текущий пароль", value: ctrl.vm.record().password_confirm(), onchange: m.withAttr("value", ctrl.vm.record().password_confirm)})
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
          ]);
}

module.exports = UserComponent;
