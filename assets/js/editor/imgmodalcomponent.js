'use strict';
var funcs = require("../helpers/funcs");

var ImgModalComponent = {}

//args: {src: m.prop(str), onhide: function}
ImgModalComponent.controller = function(args) {
  var ctrl = this;
  
  ctrl.src = args.src; //return value
  ctrl.src('');
  ctrl.error = m.prop('');

  ctrl.onfileselect = function() {
    var file = document.getElementById('image_input').files[0];
    var data = new FormData();
    data.append('upload', file);
    funcs.mrequest({
      method: 'POST', 
      url: '/api/upload', 
      data: data, 
      serialize: function(data) {return data}
    }).then(
      function(success) {
        ctrl.src(success.uri);
      },
      function(error) {
        ctrl.error(error);
      });
  }
  ctrl.onhide = function(okcancel) {
    if (okcancel == 'ok') {
    } else {
      ctrl.src('');
    }
    args.onhide(); 
  }
}

ImgModalComponent.view = function(ctrl) {
  return m('.modal.fade.in.animated.fadeIn.shown[role=dialog]', [
      m('.modal-dialog[role=document]', [
        m('.modal-content', [
          m('.modal-header', [
            m('h4.modal-title', 'Загрузка изображения'),
          ]),
          m('.modal-body', [
            m('.file-upload-wrapper.form-group', [
              m('input#image_input[type=file]', {onchange: ctrl.onfileselect}),
            ]),
            ctrl.error() ?
            m('.form-group', [
              m('label.text-danger', ctrl.error())
            ]) : "",
            m('.form-group', [
              m('label', 'Адрес изображения'),
              m('input.form-control', {value: ctrl.src(), onchange: m.withAttr('value', ctrl.src), placeholder: 'Выберите файл или укажите адрес изображения вручную'})
            ]),
          ]),
          m('.modal-footer', [
            m('button.btn.btn-primary[type=button]', {onclick: ctrl.onhide.bind(this, 'ok')}, 'Вставить'),
            m('button.btn.btn-default[type=button]', {onclick: ctrl.onhide.bind(this, 'cancel')}, 'Отмена'),
          ]),
        ]),
      ]),
  ]);
}

module.exports = ImgModalComponent;
