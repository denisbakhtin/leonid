'use strict';

var LinkModalComponent = {}

//args: {href: m.prop(str), onhide: function}
LinkModalComponent.controller = function(args) {
  var ctrl = this;
  
  ctrl.href = args.href; //return value
  ctrl.onhide = function(okcancel) {
    if (okcancel == 'cancel')
      ctrl.href('');
    args.onhide(); 
  }
}

LinkModalComponent.view = function(ctrl) {
  return m('.modal.fade.in.animated.fadeIn.shown[role=dialog]', [
      m('.modal-dialog[role=document]', [
        m('.modal-content', [
          m('.modal-header', [
            m('h4.modal-title', 'Введите адрес ссылки'),
          ]),
          m('.modal-body', [
            m('input.form-control', {value: ctrl.href(), onchange: m.withAttr('value', ctrl.href), placeholder: 'http://'}),
          ]),
          m('.modal-footer', [
            m('button.btn.btn-primary[type=button]', {onclick: ctrl.onhide.bind(this, 'ok')}, 'Вставить'),
            m('button.btn.btn-default[type=button]', {onclick: ctrl.onhide.bind(this, 'cancel')}, 'Отмена'),
          ]),
        ]),
      ]),
  ]);
}

module.exports = LinkModalComponent;
