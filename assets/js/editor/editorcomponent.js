'use strict';

var funcs = require("../helpers/funcs");

var LinkModal = require('./linkmodalcomponent');
var ImgModal = require('./imgmodalcomponent');

var EditorComponent = {}

//args: {text: m.prop(..)}
EditorComponent.controller = function(args) {
  var ctrl = this;

  ctrl.text = args.text;
  if (ctrl.text() == '')
    ctrl.text('<p></p>');
  ctrl.code = m.prop(false); //view html source
  
  ctrl.show_link_modal = m.prop(false);
  ctrl.link_href = m.prop('');
  ctrl.saved_selection = null;

  ctrl.show_img_modal = m.prop(false);
  ctrl.img_src = m.prop('');

  ctrl.on_link_modal_show = function() {
    ctrl.saved_selection = funcs.saveSelection();
    ctrl.link_href('');
    ctrl.show_link_modal(true);
  }
  ctrl.on_link_modal_hide = function() {
    funcs.restoreSelection(ctrl.saved_selection);
    if (ctrl.link_href())
      document.execCommand('createLink', false, ctrl.link_href());
    ctrl.show_link_modal(false);
  }

  ctrl.on_img_modal_show = function() {
    ctrl.saved_selection = funcs.saveSelection();
    ctrl.img_src('');
    ctrl.show_img_modal(true);
  }
  ctrl.on_img_modal_hide = function() {
    funcs.restoreSelection(ctrl.saved_selection);
    if (ctrl.img_src())
      document.execCommand('insertImage', false, ctrl.img_src());
    ctrl.show_img_modal(false);
  }
}

EditorComponent.view = function(ctrl) {
  var button = function(name, action, title) {
    return m('button.btn.btn-sm.btn-default', {
      class: (ctrl.code() && action == "code") ? "active" : "",
      disabled: (ctrl.code() && action != 'code') ? true : false,
      title: title,
      onclick: function(e) {
        e.preventDefault();
        if (action == 'code') {
          ctrl.code(!ctrl.code());
        } else if (action == 'createLink') {
          ctrl.on_link_modal_show();
        } else if (action == 'insertImage') {
          ctrl.show_img_modal(true);
        } else {
          document.execCommand(action, false);
        }
      }
    }, name)
  }

  var actions = function() {
    return [
      m('.btn-group', [
          button(m('i.fa.fa-bold'), 'bold', 'Полужирный'),
          button(m('i.fa.fa-italic'), 'italic', 'Курсив'),
          button(m('i.fa.fa-underline'), 'underline', 'Подчеркнутый'),
          button(m('i.fa.fa-strikethrough'), 'strikeThrough', 'Зачеркнутый'),
      ]),
      m('.btn-group', [
          button(m('i.fa.fa-subscript'), 'subscript', 'Верхний индекс'),
          button(m('i.fa.fa-superscript'), 'superscript', 'Нижний индекс'),
      ]),
      m('.btn-group', [
          button(m('i.fa.fa-list-ol'), 'insertOrderedList', 'Нумерованный список'),
          button(m('i.fa.fa-list-ul'), 'insertUnorderedList', 'Маркированный список'),
      ]),
      m('.btn-group', [
          button(m('i.fa.fa-align-left'), 'justifyLeft', 'По левому краю'),
          button(m('i.fa.fa-align-right'), 'justifyRight', 'По правому краю'),
          button(m('i.fa.fa-align-center'), 'justifyCenter', 'По центру'),
          button(m('i.fa.fa-align-justify'), 'justifyFull', 'По ширине'),
      ]),
      m('.btn-group', [
          button(m('i.fa.fa-undo'), 'undo', 'Отменить'),
          button(m('i.fa.fa-repeat'), 'redo', 'Повторить'),
      ]),
      m('.btn-group', [
          button(m('i.fa.fa-link'), 'createLink', 'Гиперссылка'),
          button(m('i.fa.fa-unlink'), 'unlink', 'Удалить гиперссылку'),
      ]),
      button(m('i.fa.fa-image'), 'insertImage', 'Вставить изображение'),
      button(m('i.fa.fa-eraser'), 'removeFormat', 'Очистить форматирование'),
      button(m('i.fa.fa-code'), 'code', 'Исходный код'),
    ];
  }
  
  return m('.editor', [
      m('.actions', actions()),
      ctrl.show_link_modal() ? m.component(LinkModal, {href: ctrl.link_href, onhide: ctrl.on_link_modal_hide}) : "",
      ctrl.show_img_modal() ? m.component(ImgModal, {src: ctrl.img_src, onhide: ctrl.on_img_modal_hide}) : "",
      ctrl.code() ?
      m('textarea.editor-area.form-control', {
        onchange: m.withAttr('value', ctrl.text),
        value: ctrl.text(),
      })
      :
      m('.editor-area.form-control', {
        as: ctrl.code() ? '' : 'text',
        contenteditable: true,
        config: function(el, isInited, context) {
         if (isInited) return;
         el.addEventListener('input', function() {
           ctrl.text(el.innerHTML);
           m.redraw();
         }, false);
        }
      }, m.trust(ctrl.text())),
    ]);
}

module.exports = EditorComponent;
