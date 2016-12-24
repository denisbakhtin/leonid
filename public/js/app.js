(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var Category = require('./category');


var CategoriesComponent = {};
CategoriesComponent.vm = {};
CategoriesComponent.vm.init = function(args) {
  args = args || {};
  var vm = this;
  vm.model = new Model({url: "/api/categories", type: Category});
  vm.list = vm.model.index();
  return this;
}
CategoriesComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = CategoriesComponent.vm.init();
  ctrl.updating = m.prop(true); //waiting for data update in background
  ctrl.vm.list.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
  ctrl.title = document.title = "Категории товаров";
  ctrl.pagesize = m.prop(funcs.getCookie("pagesize") || 10); //number of items per page
  ctrl.currentpage = m.prop(0); //current page, starting with 0
  ctrl.error = m.prop('');

  ctrl.show = function(row) {
    event.stopPropagation(); //prevent tr.onclick trigger
    window.location = "/category/"+row.id()+"-"+row.slug();
  }
  ctrl.edit = function(row) {
    m.route("/categories/"+row.id());
  }
  ctrl.create = function(row) {
    m.route("/categories/new");
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
          });
        },
        function(error) {
          ctrl.updating(false);
          m.redraw();
        });
  }
}
CategoriesComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        m('td', data.name()),
        m('td.shrink.text-center', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-default[title=Просмотр]', {onclick: ctrl.show.bind(this, data)}, m('i.fa.fa-eye')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))));
  } //showRowTemplate

  //complete view
  return m("#categorylist",
      m("h1", ctrl.title),
      m('div',
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()),
          m('thead', 
            m('tr',
              m('th.clickable[data-sort-by=name]', 'Название'),
              m('th.shrink.clickable[data-sort-by=published]', 'Опубликована'),
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
                m('span', 'Добавить категорию')),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : ""
          ));
}

module.exports = CategoriesComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./category":2}],2:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.slug = m.prop(data.slug || '');
  this.content = m.prop(data.content || '');
  this.published = m.prop(data.published || true);
  this.meta_description = m.prop(data.meta_description || '');
  this.meta_keywords = m.prop(data.meta_keywords || '');
}

},{}],3:[function(require,module,exports){
'use strict';
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

},{"../editor/editorcomponent":6,"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./category":2}],4:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var Category = require("./category");

var CategorySelect = {};
CategorySelect.vm = {};
CategorySelect.vm.init = function(args) {
  args = args || {};
  var vm = this;
  vm.list = funcs.mrequest({ method: "GET", url: "/api/categories", type: Category });
  return this;
}

//args: {value: m.prop, error: m.prop optional}
CategorySelect.controller = function(args) {
  args = args || {};
  var ctrl = this;
  ctrl.value = args.value;
  ctrl.vm = CategorySelect.vm.init();
  ctrl.vm.list.then(function(data){ if (data.length) ctrl.value(data[0].id()) }); //initial value
  ctrl.error = args.error || m.prop('');
}
CategorySelect.view = function(ctrl, args) {
  return m("select.form-control", {
    onchange: m.withAttr("value", ctrl.value)
  },
  ctrl.vm.list() 
  ? ctrl.vm.list().map(function(data){
    return m('option', {value: data.id()}, data.name())
  })
  : "");
}

module.exports = CategorySelect;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./category":2}],5:[function(require,module,exports){
'use strict';
/*global m */

var DashboardComponent = {
  controller: function () {
    var ctrl = this;
    ctrl.title = document.title = "Панель администратора";
  },
  view: function (ctrl) {
    return m("h1", ctrl.title);
  }
}

module.exports = DashboardComponent;

},{}],6:[function(require,module,exports){
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
      m('.btn-group',
          button(m('i.fa.fa-bold'), 'bold', 'Полужирный'),
          button(m('i.fa.fa-italic'), 'italic', 'Курсив'),
          button(m('i.fa.fa-underline'), 'underline', 'Подчеркнутый'),
          button(m('i.fa.fa-strikethrough'), 'strikeThrough', 'Зачеркнутый')),
      m('.btn-group',
          button(m('i.fa.fa-subscript'), 'subscript', 'Верхний индекс'),
          button(m('i.fa.fa-superscript'), 'superscript', 'Нижний индекс')),
      m('.btn-group',
          button(m('i.fa.fa-list-ol'), 'insertOrderedList', 'Нумерованный список'),
          button(m('i.fa.fa-list-ul'), 'insertUnorderedList', 'Маркированный список')),
      m('.btn-group',
          button(m('i.fa.fa-align-left'), 'justifyLeft', 'По левому краю'),
          button(m('i.fa.fa-align-right'), 'justifyRight', 'По правому краю'),
          button(m('i.fa.fa-align-center'), 'justifyCenter', 'По центру'),
          button(m('i.fa.fa-align-justify'), 'justifyFull', 'По ширине')),
      m('.btn-group',
          button(m('i.fa.fa-undo'), 'undo', 'Отменить'),
          button(m('i.fa.fa-repeat'), 'redo', 'Повторить')),
      m('.btn-group',
          button(m('i.fa.fa-link'), 'createLink', 'Гиперссылка'),
          button(m('i.fa.fa-unlink'), 'unlink', 'Удалить гиперссылку')),
      button(m('i.fa.fa-image'), 'insertImage', 'Вставить изображение'),
      button(m('i.fa.fa-eraser'), 'removeFormat', 'Очистить форматирование'),
      button(m('i.fa.fa-code'), 'code', 'Исходный код'),
    ];
  }
  
  return m('.editor',
      m('.actions', actions()),
      ctrl.show_link_modal() ? m.component(LinkModal, {href: ctrl.link_href, onhide: ctrl.on_link_modal_hide}) : "",
      ctrl.show_img_modal() ? m.component(ImgModal, {src: ctrl.img_src, onhide: ctrl.on_img_modal_hide}) : "",
      ctrl.code() ?
      m('textarea.editor-area.form-control', {
        onchange: m.withAttr('value', ctrl.text),
        value: ctrl.text()
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
      }, m.trust(ctrl.text())));
}

module.exports = EditorComponent;

},{"../helpers/funcs":9,"./imgmodalcomponent":7,"./linkmodalcomponent":8}],7:[function(require,module,exports){
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
  return m('.modal.fade.in.animated.fadeIn.shown[role=dialog]',
      m('.modal-dialog[role=document]',
        m('.modal-content',
          m('.modal-header',
            m('h4.modal-title', 'Загрузка изображения')),
          m('.modal-body',
            m('.file-upload-wrapper.form-group',
              m('input#image_input[type=file]', {onchange: ctrl.onfileselect})),
            ctrl.error() ?
            m('.form-group',
              m('label.text-danger', ctrl.error())) 
            : "",
            m('.form-group',
              m('label', 'Адрес изображения'),
              m('input.form-control', {value: ctrl.src(), onchange: m.withAttr('value', ctrl.src), placeholder: 'Выберите файл или укажите адрес изображения вручную'})
             )),
          m('.modal-footer',
            m('button.btn.btn-primary[type=button]', {onclick: ctrl.onhide.bind(this, 'ok')}, 'Вставить'),
            m('button.btn.btn-default[type=button]', {onclick: ctrl.onhide.bind(this, 'cancel')}, 'Отмена')
           ))));
}

module.exports = ImgModalComponent;

},{"../helpers/funcs":9}],8:[function(require,module,exports){
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
  return m('.modal.fade.in.animated.fadeIn.shown[role=dialog]',
      m('.modal-dialog[role=document]',
        m('.modal-content',
          m('.modal-header',
            m('h4.modal-title', 'Введите адрес ссылки')),
          m('.modal-body',
            m('input.form-control', {value: ctrl.href(), onchange: m.withAttr('value', ctrl.href), placeholder: 'http://'})),
          m('.modal-footer',
            m('button.btn.btn-primary[type=button]', {onclick: ctrl.onhide.bind(this, 'ok')}, 'Вставить'),
            m('button.btn.btn-default[type=button]', {onclick: ctrl.onhide.bind(this, 'cancel')}, 'Отмена')
           ))));
}

module.exports = LinkModalComponent;

},{}],9:[function(require,module,exports){
'use strict';

exports.parseError = function(errstr) {
  try {
    return joinErrors(JSON.parse(errstr));
  }
  catch(err) {
    return errstr;
  }
}

var joinErrors = function(errors) {
  if (typeof(errors) === "object") {
    let errstr = "";
    for (let key in errors) {
      if (typeof(errors[key]) === "object") {
        for (let ekey in errors[key]) {
          errstr += errors[key][ekey] + ". ";
        }
      }
    }
    return errstr;
  } else 
    return errors;
}


exports.pages = function(arlen, pagesize) {
  return Array(Math.floor(arlen/pagesize) + ((arlen%pagesize > 0) ? 1 : 0)).fill(0); //return empty array of pages
}

exports.sorts = function(list) {
  return {
    onclick: function(e) {
      var prop = e.target.getAttribute("data-sort-by");
      if (prop) {
        var first = list[0];
        list.sort(function(a, b) {
          return a[prop]() > b[prop]() ? 1 : a[prop]() < b[prop]() ? -1 : 0;
        });
        if (first === list[0]) list.reverse();
      }
    }
  }
}

exports.mrequest = function(args) {
  var nonJsonErrors = function(xhr) {
    return (xhr.status > 204 && xhr.responseText.length) 
      ? JSON.stringify(xhr.responseText) 
      : (xhr.responseText.length)
      ? xhr.responseText
      : null;
  }
  args.extract = nonJsonErrors;
  return m.request(args);
}

exports.setCookie = function(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

exports.getCookie = function(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}

exports.saveSelection = function() {
  if (window.getSelection) {
    var sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      var ranges = [];
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        ranges.push(sel.getRangeAt(i));
      }
      return ranges;
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange();
  }
  return null;
}

exports.restoreSelection = function(savedSel) {
  if (savedSel) {
    if (window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
      for (var i = 0, len = savedSel.length; i < len; ++i) {
        sel.addRange(savedSel[i]);
      }
    } else if (document.selection && savedSel.select) {
      savedSel.select();
    }
  }
}

},{}],10:[function(require,module,exports){
'use strict';

var mrequest = require("./funcs").mrequest;

//args: {url: "/api/example", type: ObjectType}
module.exports = function(args) {
  args = args || {};
  var model = this;

  model.index = function() {
    return mrequest({
      background: true,
      method: "GET", 
      url: args.url, 
      type: args.type
    })
  };
  model.get = function(id) {
    return mrequest({
      background: true,
      method: "GET", 
      url: args.url + "/" + id,
      type: args.type
    })
  };
  model.create = function(data) {
    return mrequest ({
      background: true,
      method: "POST",
      url: args.url,
      data: data,
    })
  };
  model.update = function(data) {
    return mrequest({
      background: true,
      method: "PUT",
      url: args.url + "/" + data.id(),
      data: data,
    })
  };
  model.delete = function(id) {
    return mrequest({
      background: true,
      method: "DELETE",
      url: args.url + "/" + id,
    })
  };
}


},{"./funcs":9}],11:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.uri = m.prop(data.uri || '');
}

},{}],12:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var Image = require("./image");

var ImageComponent = {};

//args: {image: m.prop(Image(..)), error: m.prop(), ondelete: callback function}
ImageComponent.controller = function (args) {
  var ctrl = this;

  ctrl.delete = function() {
    funcs.mrequest({method: "DELETE", url: "/api/images/" + args.image.id()})
      .then(
          function(success){args.ondelete();},
          function(error){args.error(error);});
  }
}
ImageComponent.view = function (ctrl, args) {

  return m(".imagecomponent.thumbnail", 
      m('img', {src: args.image.uri()}),
      m('span.fa.fa-times', {onclick: ctrl.delete, title: "Удалить"}));
}

module.exports = ImageComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/spinner":17,"./image":11}],13:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var Image = require('./image');
var ImageComponent = require('./imagecomponent');

var ImagesComponent = {};
ImagesComponent.vm = {};
ImagesComponent.vm.init = function(list) {
  var vm = this;
  vm.list = list;
  return this;
}
//list = array of Image()'s
ImagesComponent.controller = function (list) {
  var ctrl = this;

  ctrl.vm = ImagesComponent.vm.init(list);
  ctrl.updating = m.prop(false); //waiting for data update in background
  ctrl.error = m.prop('');

  ctrl.ondelete = function(index) {
    ctrl.vm.list.splice(index, 1);
  }
  ctrl.create = function() {
    ctrl.updating(true);
    var file = document.getElementById('upload_image_input').files[0];
    var data = new FormData();
    data.append('upload', file);
    document.getElementById('upload_image_input').value = ""; //clear
    funcs.mrequest({
      method: 'POST', 
      url: '/api/images', 
      data: data, 
      serialize: function(data) {return data}
    }).then(
      function(success) {
        ctrl.vm.list.push(new Image(success));
        ctrl.updating(false);
      },
      function(error) {
        ctrl.error(error);
        ctrl.updating(false);
      });
  }
}
ImagesComponent.view = function (ctrl) {
  return m("#imagelist", 
      m('#images', 
        ctrl.vm.list.map(function(data, index){
          return m.component(ImageComponent, {key: index, image: data, error: ctrl.error, ondelete: ctrl.ondelete.bind(ctrl, index)});
        }),
        ctrl.updating() ? m.component(Spinner) : ""),
      m('.file-upload-wrapper', 
        m('input#upload_image_input[type=file]', {onchange: ctrl.create})));
}

module.exports = ImagesComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/spinner":17,"./image":11,"./imagecomponent":12}],14:[function(require,module,exports){
'use strict';

function layout(component) {
  function logout() {
    m.request({
      method: "POST", 
      url: "/api/logout", 
    }).then((success) => {window.location = "/";})
  }

  var header = m("nav.navbar.navbar-default",
      m('.navbar-header',
        m('button.navbar-toggle.collapsed[type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false"]',
          m('span.sr-only', "Toggle navigation"),
          m('span.icon-bar'),
          m('span.icon-bar'),
          m('span.icon-bar')),
        m('a.navbar-brand[href="#"]', "Панель администратора")),
      m('.collapse navbar-collapse#navbar-collapse',
        m('ul.nav.navbar-nav.navbar-right',
          m('li', 
            m('a[href="/"]',
              m('i.fa.fa-play'),
              m('span', "Сайт"))),
          m('li', 
            m('a[href="#"]', {onclick: logout},
              m('i.fa.fa-sign-out'),
              m('span', "Выйти"))))));

  var navlink = function (url, title) {
    return m('li', { class: (m.route().includes(url)) ? "active" : "" }, m('a', { href: url, config: m.route }, title));
  }
  var sidebar = [
    m('.panel.panel-default',
        m('ul.nav nav-pills nav-stacked',
          navlink("/categories", "Категории товаров"),
          navlink("/products", "Товары"),
          navlink("/pages", "Страницы"),
          navlink("/users", "Пользователи")
         ))];

  return [
    header,
    m("#content-wrapper",
        m('#sidebar', sidebar),
        m('#content', m.component(component)))];
};

function mixinLayout(layout, component) {
  return function () {
    return layout(component);
  };
};

module.exports = function (component) {
  return { controller: function () { }, view: mixinLayout(layout, component) }
}

},{}],15:[function(require,module,exports){
'use strict';

var setCookie = require("../helpers/funcs").setCookie;

var PageSizeSelector = {};

//arg is an m.prop of pagesize in the parent controller
PageSizeSelector.controller = function(arg) {
  var ctrl = this;
  ctrl.setpagesize = function(size) {
    arg(size);
    setCookie("pagesize", size, 365); //store pagesize in cookies
    m.redraw();
    return false;
  };
}

PageSizeSelector.view = function(ctrl, arg) {
  return m('#pagesizeselector',
      m('span', "Показывать на странице: "),
      [10, 50, 100, 500].map(function(size) {
        return m('a[href=#]', {class: (size == arg()) ? 'active' : '', onclick: ctrl.setpagesize.bind(this, size)}, size)
      })
  );
}

module.exports = PageSizeSelector;

},{"../helpers/funcs":9}],16:[function(require,module,exports){
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

},{"../helpers/funcs":9}],17:[function(require,module,exports){
'use strict';

var LoadingSpinner = {};

LoadingSpinner.controller = function() {}
LoadingSpinner.view = function(ctrl) {
  return m('#loading-spinner.animated.fadeIn',
      m('p.text-center', m('i.fa.fa-spin.fa-cog.fa-3x')),
      m('p.text-center', 'Подождите, идет загрузка...'));
}

var UpdatingSpinner = {};

UpdatingSpinner.controller = function(args) {}
UpdatingSpinner.view = function(ctrl, args) {
  return m('#updating-spinner.animated.fadeIn',
      m('p#spinner-text', m('i.fa.fa-spin.fa-cog.fa-3x')));
}

var Spinner = {};
Spinner.controller = function(args) {
  var ctrl = this;
  ctrl.standalone = (args && args.standalone) ? true : false;
}
Spinner.view = function(ctrl, args) {
  return m('#spinner', 
      (ctrl.standalone) 
      ? m.component(LoadingSpinner) 
      : m.component(UpdatingSpinner));
}

module.exports = Spinner;

},{}],18:[function(require,module,exports){
'use strict';
/*global m */

if (document.getElementById("admin-app")) {
  var DashboardComponent = require("./dashboard");
  var CategoriesComponent = require("./category/categoriescomponent");
  var CategoryComponent = require("./category/categorycomponent");
  var ProductsComponent = require("./product/productscomponent");
  var ProductComponent = require("./product/productcomponent");
  var UsersComponent = require("./user/userscomponent");
  var UserComponent = require("./user/usercomponent");
  var PagesComponent = require("./page/pagescomponent");
  var PageComponent = require("./page/pagecomponent");
  var layout = require("./layout/layout");

  //setup routes to start w/ the `#` symbol
  m.route.mode = "hash";

  m.route(document.getElementById("admin-app"), "/", {
    "/": layout(DashboardComponent),
    "/users": layout(UsersComponent),
    "/users/:id": layout(UserComponent),
    "/pages": layout(PagesComponent),
    "/pages/:id": layout(PageComponent),
    "/categories": layout(CategoriesComponent),
    "/categories/:id": layout(CategoryComponent),
    "/products": layout(ProductsComponent),
    "/products/:id": layout(ProductComponent)
  });
}

//jquery callbacks
$(function(){
  //navbar
  $(window).on('scroll', function(){
    var threshold = 50;
    if($(window).scrollTop() > threshold){
      $('#navbar-main').addClass('scrolled');
    } else {
      $('#navbar-main').removeClass('scrolled');
    }
  });

	//top link
	$('#top-link').topLink({
		min: 400,
		fadeSpeed: 500
	});
	//smoothscroll
	$('#top-link').click(function(e) {
		e.preventDefault();
		$.scrollTo(0,300);
	});
});

//toplink plugin
jQuery.fn.topLink = function(settings) {
	settings = jQuery.extend({
		min: 1,
		fadeSpeed: 200
	}, settings);
	return this.each(function() {
		//listen for scroll
		var el = $(this);
		el.hide(); //in case the user forgot
		$(window).scroll(function() {
			if($(window).scrollTop() >= settings.min)
			{
				el.fadeIn(settings.fadeSpeed);
			}
			else
			{
				el.fadeOut(settings.fadeSpeed);
			}
		});
	});
};

},{"./category/categoriescomponent":1,"./category/categorycomponent":3,"./dashboard":5,"./layout/layout":14,"./page/pagecomponent":20,"./page/pagescomponent":21,"./product/productcomponent":23,"./product/productscomponent":24,"./user/usercomponent":26,"./user/userscomponent":27}],19:[function(require,module,exports){
'use strict';


module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.slug = m.prop(data.slug || '');
  this.content = m.prop(data.content || '');
  this.published = m.prop(data.published || true);
  this.meta_description = m.prop(data.meta_description || '');
  this.meta_keywords = m.prop(data.meta_keywords || '');
}

},{}],20:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require('../helpers/model');
var Spinner = require('../layout/spinner');
var PageSizeSelector = require('../layout/pagesizeselector');
var Paginator = require('../layout/paginator');
var Page = require('./page');
var Editor = require('../editor/editorcomponent');


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
        function(success) {m.route("/pages");},
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        });
  }
}
PageComponent.view = function (ctrl) {

  //complete view
  return m("#pagecomponent",
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn',
        m('.form-group',
          m('label', 'Заголовок'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})),
        m('.form-group',
          m('label', 'Содержание'),
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
            m('span', 'Сохранить')),
          ],
          m('button.btn.btn-danger', { onclick: ctrl.cancel },
            m('i.fa.fa-times'),
            m('span', 'Отмена'))))
              : m.component(Spinner, {standalone: true}));
}

module.exports = PageComponent;

},{"../editor/editorcomponent":6,"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./page":19}],21:[function(require,module,exports){
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

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./page":19}],22:[function(require,module,exports){
'use strict';

var Image = require('../image/image');

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.slug = m.prop(data.slug || '');
  this.content = m.prop(data.content || '');
  this.image = m.prop(data.image || '');
  this.published = m.prop(data.published || true);
  this.price = m.prop(data.price || null);
  this.category_name = m.prop((data.category) ? data.category.name : '');
  this.category_id = m.prop(data.category_id || 0);
  this.meta_description = m.prop(data.meta_description || '');
  this.meta_keywords = m.prop(data.meta_keywords || '');
  data.images = data.images || [];
  this.images = data.images.map(function(img){
    return new Image(img);
  });
}

},{"../image/image":11}],23:[function(require,module,exports){
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

},{"../category/categoryselect":4,"../editor/editorcomponent":6,"../helpers/funcs":9,"../helpers/model":10,"../image/imagescomponent":13,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./product":22}],24:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var Product = require("./product");

var ProductsComponent = {};
ProductsComponent.vm = {};
ProductsComponent.vm.init = function(args) {
  args = args || {};
  var vm = this;
  vm.model = new Model({url: "/api/products", type: Product});
  vm.list = vm.model.index();
  return this;
}
ProductsComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = ProductsComponent.vm.init();
  ctrl.updating = m.prop(true); //waiting for data update in background
  ctrl.vm.list.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
  ctrl.title = document.title = "Список товаров";
  ctrl.pagesize = m.prop(funcs.getCookie("pagesize") || 10); //number of items per page
  ctrl.currentpage = m.prop(0); //current page, starting with 0
  ctrl.error = m.prop('');

  ctrl.show = function(row) {
    event.stopPropagation(); //prevent tr.onclick trigger
    window.location = "/product/" + row.id() + "-" + row.slug();
  }
  ctrl.edit = function(row) {
    m.route("/products/"+row.id());
  }
  ctrl.create = function(row) {
    m.route("/products/new");
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
          });
        },
        function(error) {
          ctrl.updating(false);
          m.redraw();
        });
  }
}
ProductsComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        m('td.shrink', (data.image()) ? m('img.image-preview.img-responsive', {src: data.image()}) : ""),
        m('td', data.name()),
        m('td.shrink', data.category_name()),
        m('td.shrink.text-center', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-default[title=Просмотр]', {onclick: ctrl.show.bind(this, data)}, m('i.fa.fa-eye')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))));
  } //showRowTemplate

  //complete view
  return m("#productlist",
      m("h1", ctrl.title),
      m('div',
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()),
          m('thead', 
            m('tr',
              m('th.clickable[data-sort-by=image]', 'Фото'),
              m('th.clickable[data-sort-by=name]', 'Название'),
              m('th.clickable[data-sort-by=category_name]', 'Категория'),
              m('th.shrink.clickable[data-sort-by=published]', 'Опубликована'),
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
            : m.component(Spinner))),
          m('.actions',
              m('button.btn.btn-primary', { onclick: ctrl.create },
                m('i.fa.fa-plus'),
                m('span', 'Добавить товар')),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : ""));
}

module.exports = ProductsComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./product":22}],25:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.email = m.prop(data.email || '');
  this.current_password = m.prop(data.current_password || '');
  this.password = m.prop(data.password || '');
  this.password_confirm = m.prop(data.password_confirm || '');
}

},{}],26:[function(require,module,exports){
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
    ctrl.vm.model.update(ctrl.vm.record())
      .then(
          function(success) {ctrl.message('Изменения успешно сохранены');},
          function(error) {ctrl.error(funcs.parseError(error));}
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
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        }
        );
  }
}
UserComponent.view = function (ctrl) {

  //complete view
  return m("#user",
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn',
        m('.form-group',
          m('label', 'Имя'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})),
        m('.form-group',
          m('label', 'Эл. почта'),
          m('input.form-control[type=email]', {value: ctrl.vm.record().email(), onchange: m.withAttr("value", ctrl.vm.record().email)})),
        (m.route.param("id") != "new")
        ? m('.form-group',
          m('label', 'Текущий пароль'),
          m('input.form-control[type=password]', {placeholder: "Оставьте пустым, чтобы сохранить текущий пароль", value: ctrl.vm.record().current_password(), onchange: m.withAttr("value", ctrl.vm.record().current_password)})) 
        : "",
        m('.form-group',
          m('label', 'Новый пароль'),
          m('input.form-control[type=password]', {value: ctrl.vm.record().password(), onchange: m.withAttr("value", ctrl.vm.record().password)})),
        m('.form-group',
          m('label', 'Подтверждение пароля'),
          m('input.form-control[type=password]', {value: ctrl.vm.record().password_confirm(), onchange: m.withAttr("value", ctrl.vm.record().password_confirm)})),
        (ctrl.message()) ? m('.action-message.animated.fadeInRight', ctrl.message()) : "",
        (ctrl.error()) ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "",
        m('.actions',
          (m.route.param("id") == "new")
          ? m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.create, disabled: ctrl.updating() },
            (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
            m('span', 'Создать'))
          : [ m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.update, disabled: ctrl.updating() },
            (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
            m('span', 'Сохранить')) ],
          m('button.btn.btn-danger', { onclick: ctrl.cancel },
            m('i.fa.fa-times'),
            m('span', 'Отмена'))))
              : m.component(Spinner, {standalone: true}));
}

module.exports = UserComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./user":25}],27:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var User = require("./user");

var UsersComponent = {};
UsersComponent.vm = {};
UsersComponent.vm.init = function(args) {
  args = args || {};
  var vm = this;
  vm.model = new Model({url: "/api/users", type: User});
  vm.list = vm.model.index();
  return this;
}
UsersComponent.controller = function () {
  var ctrl = this;

  ctrl.vm = UsersComponent.vm.init();
  ctrl.updating = m.prop(true); //waiting for data update in background
  ctrl.vm.list.then(function() {ctrl.updating(false); m.redraw();}); //hide spinner and redraw after data arrive 
  ctrl.title = document.title = "Список пользователей";
  ctrl.pagesize = m.prop(funcs.getCookie("pagesize") || 10); //number of items per page
  ctrl.currentpage = m.prop(0); //current page, starting with 0
  ctrl.error = m.prop('');

  ctrl.edit = function(row) {
    m.route("/users/"+row.id());
  }
  ctrl.create = function(row) {
    m.route("/users/new");
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
          });
        },
        function(error) {
          ctrl.updating(false);
          m.redraw();
        });
  }
}
UsersComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        m('td', data.email()),
        m('td.shrink', data.name()),
        m('td.shrink.actions',
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))));
  } //showRowTemplate

  //complete view
  return m("#userlist",
      m("h1", ctrl.title),
      m('div',
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()),
          m('thead', 
            m('tr',
              m('th.clickable[data-sort-by=email]', 'Эл. почта'),
              m('th.shrink.clickable[data-sort-by=name]', 'Имя'),
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
            ] : m.component(Spinner))), 
          m('.actions',
              m('button.btn.btn-primary', { onclick: ctrl.create },
                m('i.fa.fa-plus'),
                m('span', 'Добавить пользователя')),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : ""));
}

module.exports = UsersComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":15,"../layout/paginator":16,"../layout/spinner":17,"./user":25}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvY2F0ZWdvcnkvY2F0ZWdvcmllc2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeS5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeWNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeXNlbGVjdC5qcyIsImFzc2V0cy9qcy9kYXNoYm9hcmQuanMiLCJhc3NldHMvanMvZWRpdG9yL2VkaXRvcmNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9lZGl0b3IvaW1nbW9kYWxjb21wb25lbnQuanMiLCJhc3NldHMvanMvZWRpdG9yL2xpbmttb2RhbGNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9oZWxwZXJzL2Z1bmNzLmpzIiwiYXNzZXRzL2pzL2hlbHBlcnMvbW9kZWwuanMiLCJhc3NldHMvanMvaW1hZ2UvaW1hZ2UuanMiLCJhc3NldHMvanMvaW1hZ2UvaW1hZ2Vjb21wb25lbnQuanMiLCJhc3NldHMvanMvaW1hZ2UvaW1hZ2VzY29tcG9uZW50LmpzIiwiYXNzZXRzL2pzL2xheW91dC9sYXlvdXQuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3IuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2luYXRvci5qcyIsImFzc2V0cy9qcy9sYXlvdXQvc3Bpbm5lci5qcyIsImFzc2V0cy9qcy9tYWluLmpzIiwiYXNzZXRzL2pzL3BhZ2UvcGFnZS5qcyIsImFzc2V0cy9qcy9wYWdlL3BhZ2Vjb21wb25lbnQuanMiLCJhc3NldHMvanMvcGFnZS9wYWdlc2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9wcm9kdWN0L3Byb2R1Y3QuanMiLCJhc3NldHMvanMvcHJvZHVjdC9wcm9kdWN0Y29tcG9uZW50LmpzIiwiYXNzZXRzL2pzL3Byb2R1Y3QvcHJvZHVjdHNjb21wb25lbnQuanMiLCJhc3NldHMvanMvdXNlci91c2VyLmpzIiwiYXNzZXRzL2pzL3VzZXIvdXNlcmNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy91c2VyL3VzZXJzY29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBDYXRlZ29yeSA9IHJlcXVpcmUoJy4vY2F0ZWdvcnknKTtcblxuXG52YXIgQ2F0ZWdvcmllc0NvbXBvbmVudCA9IHt9O1xuQ2F0ZWdvcmllc0NvbXBvbmVudC52bSA9IHt9O1xuQ2F0ZWdvcmllc0NvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL2NhdGVnb3JpZXNcIiwgdHlwZTogQ2F0ZWdvcnl9KTtcbiAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KCk7XG4gIHJldHVybiB0aGlzO1xufVxuQ2F0ZWdvcmllc0NvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgY3RybC52bSA9IENhdGVnb3JpZXNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0JrQsNGC0LXQs9C+0YDQuNC4INGC0L7QstCw0YDQvtCyXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZnVuY3MuZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuc2hvdyA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgd2luZG93LmxvY2F0aW9uID0gXCIvY2F0ZWdvcnkvXCIrcm93LmlkKCkrXCItXCIrcm93LnNsdWcoKTtcbiAgfVxuICBjdHJsLmVkaXQgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL2NhdGVnb3JpZXMvXCIrcm93LmlkKCkpO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9jYXRlZ29yaWVzL25ld1wiKTtcbiAgfVxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKTtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gZnVuY3MucGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfSk7XG4gIH1cbn1cbkNhdGVnb3JpZXNDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgdmFyIHNob3dSb3dUZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbSgndHIuY2xpY2thYmxlJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluay50ZXh0LWNlbnRlcicsIGRhdGEucHVibGlzaGVkKCkgPyBtKCdpLmZhLmZhLWNoZWNrJykgOiBtKCdpLmZhLmZhLXRpbWVzJykpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90KDQtdC00LDQutGC0LjRgNC+0LLQsNGC0YxdJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90J/RgNC+0YHQvNC+0YLRgF0nLCB7b25jbGljazogY3RybC5zaG93LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLWV5ZScpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGFuZ2VyW3RpdGxlPdCj0LTQsNC70LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmRlbGV0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1yZW1vdmUnKSkpKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNjYXRlZ29yeWxpc3RcIixcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIG0oJ2RpdicsXG4gICAgICAgIG0oJ3RhYmxlLnRhYmxlLnRhYmxlLXN0cmlwZWQuYW5pbWF0ZWQuZmFkZUluJywgZnVuY3Muc29ydHMoY3RybC52bS5saXN0KCkpLFxuICAgICAgICAgIG0oJ3RoZWFkJywgXG4gICAgICAgICAgICBtKCd0cicsXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9bmFtZV0nLCAn0J3QsNC30LLQsNC90LjQtScpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1wdWJsaXNoZWRdJywgJ9Ce0L/Rg9Cx0LvQuNC60L7QstCw0L3QsCcpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuYWN0aW9ucycsICcjJykpKSxcbiAgICAgICAgICBtKCd0Ym9keScsIFxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKCFjdHJsLnZtLmxpc3QoKS5sZW5ndGgpIFxuICAgICAgICAgICAgPyBtKCd0cicsIG0oJ3RkLnRleHQtY2VudGVyLnRleHQtbXV0ZWRbY29sc3Bhbj00XScsICfQodC/0LjRgdC+0Log0L/Rg9GB0YIsINC90LDQttC80LjRgtC1INCU0L7QsdCw0LLQuNGC0YwsINGH0YLQvtCx0Ysg0YHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQt9Cw0L/QuNGB0YwuJykpXG4gICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKCkgPyBtLmNvbXBvbmVudChTcGlubmVyKSA6IFwiXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcbiAgICAgICAgICAgKSksIFxuICAgICAgICAgIG0oJy5hY3Rpb25zJywgXG4gICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnknLCB7IG9uY2xpY2s6IGN0cmwuY3JlYXRlIH0sIFxuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDQutCw0YLQtdCz0L7RgNC40Y4nKSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCJcbiAgICAgICAgICApKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXRlZ29yaWVzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5zbHVnID0gbS5wcm9wKGRhdGEuc2x1ZyB8fCAnJyk7XG4gIHRoaXMuY29udGVudCA9IG0ucHJvcChkYXRhLmNvbnRlbnQgfHwgJycpO1xuICB0aGlzLnB1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLnB1Ymxpc2hlZCB8fCB0cnVlKTtcbiAgdGhpcy5tZXRhX2Rlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEubWV0YV9kZXNjcmlwdGlvbiB8fCAnJyk7XG4gIHRoaXMubWV0YV9rZXl3b3JkcyA9IG0ucHJvcChkYXRhLm1ldGFfa2V5d29yZHMgfHwgJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBDYXRlZ29yeSA9IHJlcXVpcmUoXCIuL2NhdGVnb3J5XCIpO1xudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvci9lZGl0b3Jjb21wb25lbnQnKTtcblxudmFyIENhdGVnb3J5Q29tcG9uZW50ID0ge307XG5DYXRlZ29yeUNvbXBvbmVudC52bSA9IHt9O1xuQ2F0ZWdvcnlDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvY2F0ZWdvcmllc1wiLCB0eXBlOiBDYXRlZ29yeX0pO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICB2bS5yZWNvcmQgPSBtLnByb3AobmV3IENhdGVnb3J5KCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbkNhdGVnb3J5Q29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gQ2F0ZWdvcnlDb21wb25lbnQudm0uaW5pdCgpO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKTtcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCh0L7Qt9C00LDQvdC40LUg0LrQsNGC0LXQs9C+0YDQuNC4XCI7XG4gIH0gZWxzZSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gICAgY3RybC52bS5yZWNvcmQudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgNGC0L7Rh9C60LAg0LrQsNGC0LXQs9C+0YDQuNC4XCI7XG4gIH1cbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG4gIGN0cmwubWVzc2FnZSA9IG0ucHJvcCgnJyk7IC8vbm90aWZpY2F0aW9uc1xuXG4gIGN0cmwuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgbS5yb3V0ZShcIi9jYXRlZ29yaWVzXCIpO1xuICB9XG4gIGN0cmwudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC5tZXNzYWdlKCcnKTtcbiAgICBjdHJsLmVycm9yKCcnKTtcbiAgICBjdHJsLnZtLm1vZGVsLnVwZGF0ZShjdHJsLnZtLnJlY29yZCgpKVxuICAgICAgLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge2N0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO30sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTt9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KTtcbiAgfVxuICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC52bS5yZWNvcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHttLnJvdXRlKFwiL2NhdGVnb3JpZXNcIil9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9KTtcbiAgfVxufVxuQ2F0ZWdvcnlDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgcmV0dXJuIG0oXCIjY2F0ZWdvcnljb21wb25lbnRcIixcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIGN0cmwudm0ucmVjb3JkKClcbiAgICAgID8gbSgnZm9ybS5hbmltYXRlZC5mYWRlSW4nLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J3QsNC30LLQsNC90LjQtScpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5uYW1lKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5uYW1lKX0pKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ce0L/QuNGB0LDQvdC40LUnKSxcbiAgICAgICAgICBtLmNvbXBvbmVudChFZGl0b3IsIHt0ZXh0OiBjdHJsLnZtLnJlY29yZCgpLmNvbnRlbnR9KSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICBtKCdsYWJlbCcsICfQnNC10YLQsCDQvtC/0LjRgdCw0L3QuNC1JyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm1ldGFfZGVzY3JpcHRpb24oKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm1ldGFfZGVzY3JpcHRpb24pfSkpLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JzQtdGC0LAg0LrQu9GO0YfQtdCy0LjQutC4JyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm1ldGFfa2V5d29yZHMoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm1ldGFfa2V5d29yZHMpfSkpLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMJyksXG4gICAgICAgICAgbSgnaW5wdXRbdHlwZT1jaGVja2JveF0nLCB7Y2hlY2tlZDogY3RybC52bS5yZWNvcmQoKS5wdWJsaXNoZWQoKSwgb25jbGljazogbS53aXRoQXR0cihcImNoZWNrZWRcIiwgY3RybC52bS5yZWNvcmQoKS5wdWJsaXNoZWQpfSkpLFxuICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgKGN0cmwuZXJyb3IoKSkgPyBtKCcuYWN0aW9uLWFsZXJ0LmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5lcnJvcigpKSA6IFwiXCIsXG4gICAgICAgIG0oJy5hY3Rpb25zJyxcbiAgICAgICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIilcbiAgICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LFxuICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtC30LTQsNGC0YwnKSlcbiAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLnVwZGF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LFxuICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJykpXSxcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLWRhbmdlcicsIHsgb25jbGljazogY3RybC5jYW5jZWwgfSxcbiAgICAgICAgICAgICAgbSgnaS5mYS5mYS10aW1lcycpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ce0YLQvNC10L3QsCcpKSkpXG4gICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyLCB7c3RhbmRhbG9uZTogdHJ1ZX0pKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXRlZ29yeUNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKFwiLi4vaGVscGVycy9tb2RlbFwiKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZShcIi4uL2xheW91dC9zcGlubmVyXCIpO1xudmFyIFBhZ2VTaXplU2VsZWN0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3JcIik7XG52YXIgUGFnaW5hdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdpbmF0b3JcIik7XG52YXIgQ2F0ZWdvcnkgPSByZXF1aXJlKFwiLi9jYXRlZ29yeVwiKTtcblxudmFyIENhdGVnb3J5U2VsZWN0ID0ge307XG5DYXRlZ29yeVNlbGVjdC52bSA9IHt9O1xuQ2F0ZWdvcnlTZWxlY3Qudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLmxpc3QgPSBmdW5jcy5tcmVxdWVzdCh7IG1ldGhvZDogXCJHRVRcIiwgdXJsOiBcIi9hcGkvY2F0ZWdvcmllc1wiLCB0eXBlOiBDYXRlZ29yeSB9KTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vYXJnczoge3ZhbHVlOiBtLnByb3AsIGVycm9yOiBtLnByb3Agb3B0aW9uYWx9XG5DYXRlZ29yeVNlbGVjdC5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBjdHJsLnZhbHVlID0gYXJncy52YWx1ZTtcbiAgY3RybC52bSA9IENhdGVnb3J5U2VsZWN0LnZtLmluaXQoKTtcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oZGF0YSl7IGlmIChkYXRhLmxlbmd0aCkgY3RybC52YWx1ZShkYXRhWzBdLmlkKCkpIH0pOyAvL2luaXRpYWwgdmFsdWVcbiAgY3RybC5lcnJvciA9IGFyZ3MuZXJyb3IgfHwgbS5wcm9wKCcnKTtcbn1cbkNhdGVnb3J5U2VsZWN0LnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gIHJldHVybiBtKFwic2VsZWN0LmZvcm0tY29udHJvbFwiLCB7XG4gICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZhbHVlKVxuICB9LFxuICBjdHJsLnZtLmxpc3QoKSBcbiAgPyBjdHJsLnZtLmxpc3QoKS5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgcmV0dXJuIG0oJ29wdGlvbicsIHt2YWx1ZTogZGF0YS5pZCgpfSwgZGF0YS5uYW1lKCkpXG4gIH0pXG4gIDogXCJcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2F0ZWdvcnlTZWxlY3Q7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBEYXNoYm9hcmRDb21wb25lbnQgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiO1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbiAoY3RybCkge1xuICAgIHJldHVybiBtKFwiaDFcIiwgY3RybC50aXRsZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEYXNoYm9hcmRDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xuXG52YXIgTGlua01vZGFsID0gcmVxdWlyZSgnLi9saW5rbW9kYWxjb21wb25lbnQnKTtcbnZhciBJbWdNb2RhbCA9IHJlcXVpcmUoJy4vaW1nbW9kYWxjb21wb25lbnQnKTtcblxudmFyIEVkaXRvckNvbXBvbmVudCA9IHt9XG5cbi8vYXJnczoge3RleHQ6IG0ucHJvcCguLil9XG5FZGl0b3JDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudGV4dCA9IGFyZ3MudGV4dDtcbiAgaWYgKGN0cmwudGV4dCgpID09ICcnKVxuICAgIGN0cmwudGV4dCgnPHA+PC9wPicpO1xuICBjdHJsLmNvZGUgPSBtLnByb3AoZmFsc2UpOyAvL3ZpZXcgaHRtbCBzb3VyY2VcbiAgXG4gIGN0cmwuc2hvd19saW5rX21vZGFsID0gbS5wcm9wKGZhbHNlKTtcbiAgY3RybC5saW5rX2hyZWYgPSBtLnByb3AoJycpO1xuICBjdHJsLnNhdmVkX3NlbGVjdGlvbiA9IG51bGw7XG5cbiAgY3RybC5zaG93X2ltZ19tb2RhbCA9IG0ucHJvcChmYWxzZSk7XG4gIGN0cmwuaW1nX3NyYyA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5vbl9saW5rX21vZGFsX3Nob3cgPSBmdW5jdGlvbigpIHtcbiAgICBjdHJsLnNhdmVkX3NlbGVjdGlvbiA9IGZ1bmNzLnNhdmVTZWxlY3Rpb24oKTtcbiAgICBjdHJsLmxpbmtfaHJlZignJyk7XG4gICAgY3RybC5zaG93X2xpbmtfbW9kYWwodHJ1ZSk7XG4gIH1cbiAgY3RybC5vbl9saW5rX21vZGFsX2hpZGUgPSBmdW5jdGlvbigpIHtcbiAgICBmdW5jcy5yZXN0b3JlU2VsZWN0aW9uKGN0cmwuc2F2ZWRfc2VsZWN0aW9uKTtcbiAgICBpZiAoY3RybC5saW5rX2hyZWYoKSlcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjcmVhdGVMaW5rJywgZmFsc2UsIGN0cmwubGlua19ocmVmKCkpO1xuICAgIGN0cmwuc2hvd19saW5rX21vZGFsKGZhbHNlKTtcbiAgfVxuXG4gIGN0cmwub25faW1nX21vZGFsX3Nob3cgPSBmdW5jdGlvbigpIHtcbiAgICBjdHJsLnNhdmVkX3NlbGVjdGlvbiA9IGZ1bmNzLnNhdmVTZWxlY3Rpb24oKTtcbiAgICBjdHJsLmltZ19zcmMoJycpO1xuICAgIGN0cmwuc2hvd19pbWdfbW9kYWwodHJ1ZSk7XG4gIH1cbiAgY3RybC5vbl9pbWdfbW9kYWxfaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmNzLnJlc3RvcmVTZWxlY3Rpb24oY3RybC5zYXZlZF9zZWxlY3Rpb24pO1xuICAgIGlmIChjdHJsLmltZ19zcmMoKSlcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdpbnNlcnRJbWFnZScsIGZhbHNlLCBjdHJsLmltZ19zcmMoKSk7XG4gICAgY3RybC5zaG93X2ltZ19tb2RhbChmYWxzZSk7XG4gIH1cbn1cblxuRWRpdG9yQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHZhciBidXR0b24gPSBmdW5jdGlvbihuYW1lLCBhY3Rpb24sIHRpdGxlKSB7XG4gICAgcmV0dXJuIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0Jywge1xuICAgICAgY2xhc3M6IChjdHJsLmNvZGUoKSAmJiBhY3Rpb24gPT0gXCJjb2RlXCIpID8gXCJhY3RpdmVcIiA6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogKGN0cmwuY29kZSgpICYmIGFjdGlvbiAhPSAnY29kZScpID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgb25jbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChhY3Rpb24gPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgY3RybC5jb2RlKCFjdHJsLmNvZGUoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09ICdjcmVhdGVMaW5rJykge1xuICAgICAgICAgIGN0cmwub25fbGlua19tb2RhbF9zaG93KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09ICdpbnNlcnRJbWFnZScpIHtcbiAgICAgICAgICBjdHJsLnNob3dfaW1nX21vZGFsKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKGFjdGlvbiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgbmFtZSlcbiAgfVxuXG4gIHZhciBhY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJy5idG4tZ3JvdXAnLFxuICAgICAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWJvbGQnKSwgJ2JvbGQnLCAn0J/QvtC70YPQttC40YDQvdGL0LknKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1pdGFsaWMnKSwgJ2l0YWxpYycsICfQmtGD0YDRgdC40LInKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS11bmRlcmxpbmUnKSwgJ3VuZGVybGluZScsICfQn9C+0LTRh9C10YDQutC90YPRgtGL0LknKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1zdHJpa2V0aHJvdWdoJyksICdzdHJpa2VUaHJvdWdoJywgJ9CX0LDRh9C10YDQutC90YPRgtGL0LknKSksXG4gICAgICBtKCcuYnRuLWdyb3VwJyxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1zdWJzY3JpcHQnKSwgJ3N1YnNjcmlwdCcsICfQktC10YDRhdC90LjQuSDQuNC90LTQtdC60YEnKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1zdXBlcnNjcmlwdCcpLCAnc3VwZXJzY3JpcHQnLCAn0J3QuNC20L3QuNC5INC40L3QtNC10LrRgScpKSxcbiAgICAgIG0oJy5idG4tZ3JvdXAnLFxuICAgICAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWxpc3Qtb2wnKSwgJ2luc2VydE9yZGVyZWRMaXN0JywgJ9Cd0YPQvNC10YDQvtCy0LDQvdC90YvQuSDRgdC/0LjRgdC+0LonKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1saXN0LXVsJyksICdpbnNlcnRVbm9yZGVyZWRMaXN0JywgJ9Cc0LDRgNC60LjRgNC+0LLQsNC90L3Ri9C5INGB0L/QuNGB0L7QuicpKSxcbiAgICAgIG0oJy5idG4tZ3JvdXAnLFxuICAgICAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWFsaWduLWxlZnQnKSwgJ2p1c3RpZnlMZWZ0JywgJ9Cf0L4g0LvQtdCy0L7QvNGDINC60YDQsNGOJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtYWxpZ24tcmlnaHQnKSwgJ2p1c3RpZnlSaWdodCcsICfQn9C+INC/0YDQsNCy0L7QvNGDINC60YDQsNGOJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtYWxpZ24tY2VudGVyJyksICdqdXN0aWZ5Q2VudGVyJywgJ9Cf0L4g0YbQtdC90YLRgNGDJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtYWxpZ24tanVzdGlmeScpLCAnanVzdGlmeUZ1bGwnLCAn0J/QviDRiNC40YDQuNC90LUnKSksXG4gICAgICBtKCcuYnRuLWdyb3VwJyxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS11bmRvJyksICd1bmRvJywgJ9Ce0YLQvNC10L3QuNGC0YwnKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1yZXBlYXQnKSwgJ3JlZG8nLCAn0J/QvtCy0YLQvtGA0LjRgtGMJykpLFxuICAgICAgbSgnLmJ0bi1ncm91cCcsXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtbGluaycpLCAnY3JlYXRlTGluaycsICfQk9C40L/QtdGA0YHRgdGL0LvQutCwJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtdW5saW5rJyksICd1bmxpbmsnLCAn0KPQtNCw0LvQuNGC0Ywg0LPQuNC/0LXRgNGB0YHRi9C70LrRgycpKSxcbiAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWltYWdlJyksICdpbnNlcnRJbWFnZScsICfQktGB0YLQsNCy0LjRgtGMINC40LfQvtCx0YDQsNC20LXQvdC40LUnKSxcbiAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWVyYXNlcicpLCAncmVtb3ZlRm9ybWF0JywgJ9Ce0YfQuNGB0YLQuNGC0Ywg0YTQvtGA0LzQsNGC0LjRgNC+0LLQsNC90LjQtScpLFxuICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtY29kZScpLCAnY29kZScsICfQmNGB0YXQvtC00L3Ri9C5INC60L7QtCcpLFxuICAgIF07XG4gIH1cbiAgXG4gIHJldHVybiBtKCcuZWRpdG9yJyxcbiAgICAgIG0oJy5hY3Rpb25zJywgYWN0aW9ucygpKSxcbiAgICAgIGN0cmwuc2hvd19saW5rX21vZGFsKCkgPyBtLmNvbXBvbmVudChMaW5rTW9kYWwsIHtocmVmOiBjdHJsLmxpbmtfaHJlZiwgb25oaWRlOiBjdHJsLm9uX2xpbmtfbW9kYWxfaGlkZX0pIDogXCJcIixcbiAgICAgIGN0cmwuc2hvd19pbWdfbW9kYWwoKSA/IG0uY29tcG9uZW50KEltZ01vZGFsLCB7c3JjOiBjdHJsLmltZ19zcmMsIG9uaGlkZTogY3RybC5vbl9pbWdfbW9kYWxfaGlkZX0pIDogXCJcIixcbiAgICAgIGN0cmwuY29kZSgpID9cbiAgICAgIG0oJ3RleHRhcmVhLmVkaXRvci1hcmVhLmZvcm0tY29udHJvbCcsIHtcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC50ZXh0KSxcbiAgICAgICAgdmFsdWU6IGN0cmwudGV4dCgpXG4gICAgICB9KVxuICAgICAgOlxuICAgICAgbSgnLmVkaXRvci1hcmVhLmZvcm0tY29udHJvbCcsIHtcbiAgICAgICAgYXM6IGN0cmwuY29kZSgpID8gJycgOiAndGV4dCcsXG4gICAgICAgIGNvbnRlbnRlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaXNJbml0ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgIGlmIChpc0luaXRlZCkgcmV0dXJuO1xuICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgY3RybC50ZXh0KGVsLmlubmVySFRNTCk7XG4gICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0sIG0udHJ1c3QoY3RybC50ZXh0KCkpKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG5cbnZhciBJbWdNb2RhbENvbXBvbmVudCA9IHt9XG5cbi8vYXJnczoge3NyYzogbS5wcm9wKHN0ciksIG9uaGlkZTogZnVuY3Rpb259XG5JbWdNb2RhbENvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY3RybCA9IHRoaXM7XG4gIFxuICBjdHJsLnNyYyA9IGFyZ3Muc3JjOyAvL3JldHVybiB2YWx1ZVxuICBjdHJsLnNyYygnJyk7XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwub25maWxlc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1hZ2VfaW5wdXQnKS5maWxlc1swXTtcbiAgICB2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGRhdGEuYXBwZW5kKCd1cGxvYWQnLCBmaWxlKTtcbiAgICBmdW5jcy5tcmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICB1cmw6ICcvYXBpL3VwbG9hZCcsIFxuICAgICAgZGF0YTogZGF0YSwgXG4gICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gZGF0YX1cbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICBjdHJsLnNyYyhzdWNjZXNzLnVyaSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgY3RybC5lcnJvcihlcnJvcik7XG4gICAgICB9KTtcbiAgfVxuICBjdHJsLm9uaGlkZSA9IGZ1bmN0aW9uKG9rY2FuY2VsKSB7XG4gICAgaWYgKG9rY2FuY2VsID09ICdvaycpIHtcbiAgICB9IGVsc2Uge1xuICAgICAgY3RybC5zcmMoJycpO1xuICAgIH1cbiAgICBhcmdzLm9uaGlkZSgpOyBcbiAgfVxufVxuXG5JbWdNb2RhbENvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gbSgnLm1vZGFsLmZhZGUuaW4uYW5pbWF0ZWQuZmFkZUluLnNob3duW3JvbGU9ZGlhbG9nXScsXG4gICAgICBtKCcubW9kYWwtZGlhbG9nW3JvbGU9ZG9jdW1lbnRdJyxcbiAgICAgICAgbSgnLm1vZGFsLWNvbnRlbnQnLFxuICAgICAgICAgIG0oJy5tb2RhbC1oZWFkZXInLFxuICAgICAgICAgICAgbSgnaDQubW9kYWwtdGl0bGUnLCAn0JfQsNCz0YDRg9C30LrQsCDQuNC30L7QsdGA0LDQttC10L3QuNGPJykpLFxuICAgICAgICAgIG0oJy5tb2RhbC1ib2R5JyxcbiAgICAgICAgICAgIG0oJy5maWxlLXVwbG9hZC13cmFwcGVyLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgICBtKCdpbnB1dCNpbWFnZV9pbnB1dFt0eXBlPWZpbGVdJywge29uY2hhbmdlOiBjdHJsLm9uZmlsZXNlbGVjdH0pKSxcbiAgICAgICAgICAgIGN0cmwuZXJyb3IoKSA/XG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICAgIG0oJ2xhYmVsLnRleHQtZGFuZ2VyJywgY3RybC5lcnJvcigpKSkgXG4gICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICAgIG0oJ2xhYmVsJywgJ9CQ0LTRgNC10YEg0LjQt9C+0LHRgNCw0LbQtdC90LjRjycpLFxuICAgICAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwuc3JjKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwuc3JjKSwgcGxhY2Vob2xkZXI6ICfQktGL0LHQtdGA0LjRgtC1INGE0LDQudC7INC40LvQuCDRg9C60LDQttC40YLQtSDQsNC00YDQtdGBINC40LfQvtCx0YDQsNC20LXQvdC40Y8g0LLRgNGD0YfQvdGD0Y4nfSlcbiAgICAgICAgICAgICApKSxcbiAgICAgICAgICBtKCcubW9kYWwtZm9vdGVyJyxcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1idXR0b25dJywge29uY2xpY2s6IGN0cmwub25oaWRlLmJpbmQodGhpcywgJ29rJyl9LCAn0JLRgdGC0LDQstC40YLRjCcpLFxuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tZGVmYXVsdFt0eXBlPWJ1dHRvbl0nLCB7b25jbGljazogY3RybC5vbmhpZGUuYmluZCh0aGlzLCAnY2FuY2VsJyl9LCAn0J7RgtC80LXQvdCwJylcbiAgICAgICAgICAgKSkpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbWdNb2RhbENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIExpbmtNb2RhbENvbXBvbmVudCA9IHt9XG5cbi8vYXJnczoge2hyZWY6IG0ucHJvcChzdHIpLCBvbmhpZGU6IGZ1bmN0aW9ufVxuTGlua01vZGFsQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjdHJsID0gdGhpcztcbiAgXG4gIGN0cmwuaHJlZiA9IGFyZ3MuaHJlZjsgLy9yZXR1cm4gdmFsdWVcbiAgY3RybC5vbmhpZGUgPSBmdW5jdGlvbihva2NhbmNlbCkge1xuICAgIGlmIChva2NhbmNlbCA9PSAnY2FuY2VsJylcbiAgICAgIGN0cmwuaHJlZignJyk7XG4gICAgYXJncy5vbmhpZGUoKTsgXG4gIH1cbn1cblxuTGlua01vZGFsQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHJldHVybiBtKCcubW9kYWwuZmFkZS5pbi5hbmltYXRlZC5mYWRlSW4uc2hvd25bcm9sZT1kaWFsb2ddJyxcbiAgICAgIG0oJy5tb2RhbC1kaWFsb2dbcm9sZT1kb2N1bWVudF0nLFxuICAgICAgICBtKCcubW9kYWwtY29udGVudCcsXG4gICAgICAgICAgbSgnLm1vZGFsLWhlYWRlcicsXG4gICAgICAgICAgICBtKCdoNC5tb2RhbC10aXRsZScsICfQktCy0LXQtNC40YLQtSDQsNC00YDQtdGBINGB0YHRi9C70LrQuCcpKSxcbiAgICAgICAgICBtKCcubW9kYWwtYm9keScsXG4gICAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwuaHJlZigpLCBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmhyZWYpLCBwbGFjZWhvbGRlcjogJ2h0dHA6Ly8nfSkpLFxuICAgICAgICAgIG0oJy5tb2RhbC1mb290ZXInLFxuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPWJ1dHRvbl0nLCB7b25jbGljazogY3RybC5vbmhpZGUuYmluZCh0aGlzLCAnb2snKX0sICfQktGB0YLQsNCy0LjRgtGMJyksXG4gICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1kZWZhdWx0W3R5cGU9YnV0dG9uXScsIHtvbmNsaWNrOiBjdHJsLm9uaGlkZS5iaW5kKHRoaXMsICdjYW5jZWwnKX0sICfQntGC0LzQtdC90LAnKVxuICAgICAgICAgICApKSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmtNb2RhbENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5wYXJzZUVycm9yID0gZnVuY3Rpb24oZXJyc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGpvaW5FcnJvcnMoSlNPTi5wYXJzZShlcnJzdHIpKTtcbiAgfVxuICBjYXRjaChlcnIpIHtcbiAgICByZXR1cm4gZXJyc3RyO1xuICB9XG59XG5cbnZhciBqb2luRXJyb3JzID0gZnVuY3Rpb24oZXJyb3JzKSB7XG4gIGlmICh0eXBlb2YoZXJyb3JzKSA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBlcnJzdHIgPSBcIlwiO1xuICAgIGZvciAobGV0IGtleSBpbiBlcnJvcnMpIHtcbiAgICAgIGlmICh0eXBlb2YoZXJyb3JzW2tleV0pID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGZvciAobGV0IGVrZXkgaW4gZXJyb3JzW2tleV0pIHtcbiAgICAgICAgICBlcnJzdHIgKz0gZXJyb3JzW2tleV1bZWtleV0gKyBcIi4gXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVycnN0cjtcbiAgfSBlbHNlIFxuICAgIHJldHVybiBlcnJvcnM7XG59XG5cblxuZXhwb3J0cy5wYWdlcyA9IGZ1bmN0aW9uKGFybGVuLCBwYWdlc2l6ZSkge1xuICByZXR1cm4gQXJyYXkoTWF0aC5mbG9vcihhcmxlbi9wYWdlc2l6ZSkgKyAoKGFybGVuJXBhZ2VzaXplID4gMCkgPyAxIDogMCkpLmZpbGwoMCk7IC8vcmV0dXJuIGVtcHR5IGFycmF5IG9mIHBhZ2VzXG59XG5cbmV4cG9ydHMuc29ydHMgPSBmdW5jdGlvbihsaXN0KSB7XG4gIHJldHVybiB7XG4gICAgb25jbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHByb3AgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtYnlcIik7XG4gICAgICBpZiAocHJvcCkge1xuICAgICAgICB2YXIgZmlyc3QgPSBsaXN0WzBdO1xuICAgICAgICBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBhW3Byb3BdKCkgPiBiW3Byb3BdKCkgPyAxIDogYVtwcm9wXSgpIDwgYltwcm9wXSgpID8gLTEgOiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGZpcnN0ID09PSBsaXN0WzBdKSBsaXN0LnJldmVyc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5tcmVxdWVzdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIG5vbkpzb25FcnJvcnMgPSBmdW5jdGlvbih4aHIpIHtcbiAgICByZXR1cm4gKHhoci5zdGF0dXMgPiAyMDQgJiYgeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGgpIFxuICAgICAgPyBKU09OLnN0cmluZ2lmeSh4aHIucmVzcG9uc2VUZXh0KSBcbiAgICAgIDogKHhoci5yZXNwb25zZVRleHQubGVuZ3RoKVxuICAgICAgPyB4aHIucmVzcG9uc2VUZXh0XG4gICAgICA6IG51bGw7XG4gIH1cbiAgYXJncy5leHRyYWN0ID0gbm9uSnNvbkVycm9ycztcbiAgcmV0dXJuIG0ucmVxdWVzdChhcmdzKTtcbn1cblxuZXhwb3J0cy5zZXRDb29raWUgPSBmdW5jdGlvbihjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoZXhkYXlzKjI0KjYwKjYwKjEwMDApKTtcbiAgdmFyIGV4cGlyZXMgPSBcImV4cGlyZXM9XCIrIGQudG9VVENTdHJpbmcoKTtcbiAgZG9jdW1lbnQuY29va2llID0gY25hbWUgKyBcIj1cIiArIGN2YWx1ZSArIFwiO1wiICsgZXhwaXJlcyArIFwiO3BhdGg9L1wiO1xufVxuXG5leHBvcnRzLmdldENvb2tpZSA9IGZ1bmN0aW9uKGNuYW1lKSB7XG4gIHZhciBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgdmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gIGZvcih2YXIgaSA9IDA7IGkgPGNhLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGMgPSBjYVtpXTtcbiAgICB3aGlsZSAoYy5jaGFyQXQoMCk9PScgJykge1xuICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgIHJldHVybiBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCxjLmxlbmd0aCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBcIlwiO1xufVxuXG5leHBvcnRzLnNhdmVTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIGlmIChzZWwuZ2V0UmFuZ2VBdCAmJiBzZWwucmFuZ2VDb3VudCkge1xuICAgICAgdmFyIHJhbmdlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlbC5yYW5nZUNvdW50OyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgcmFuZ2VzLnB1c2goc2VsLmdldFJhbmdlQXQoaSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJhbmdlcztcbiAgICB9XG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uICYmIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0cy5yZXN0b3JlU2VsZWN0aW9uID0gZnVuY3Rpb24oc2F2ZWRTZWwpIHtcbiAgaWYgKHNhdmVkU2VsKSB7XG4gICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgIHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2F2ZWRTZWwubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgc2VsLmFkZFJhbmdlKHNhdmVkU2VsW2ldKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnNlbGVjdGlvbiAmJiBzYXZlZFNlbC5zZWxlY3QpIHtcbiAgICAgIHNhdmVkU2VsLnNlbGVjdCgpO1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXJlcXVlc3QgPSByZXF1aXJlKFwiLi9mdW5jc1wiKS5tcmVxdWVzdDtcblxuLy9hcmdzOiB7dXJsOiBcIi9hcGkvZXhhbXBsZVwiLCB0eXBlOiBPYmplY3RUeXBlfVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcmdzKSB7XG4gIGFyZ3MgPSBhcmdzIHx8IHt9O1xuICB2YXIgbW9kZWwgPSB0aGlzO1xuXG4gIG1vZGVsLmluZGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0KHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsIFxuICAgICAgdXJsOiBhcmdzLnVybCwgXG4gICAgICB0eXBlOiBhcmdzLnR5cGVcbiAgICB9KVxuICB9O1xuICBtb2RlbC5nZXQgPSBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiBtcmVxdWVzdCh7XG4gICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgbWV0aG9kOiBcIkdFVFwiLCBcbiAgICAgIHVybDogYXJncy51cmwgKyBcIi9cIiArIGlkLFxuICAgICAgdHlwZTogYXJncy50eXBlXG4gICAgfSlcbiAgfTtcbiAgbW9kZWwuY3JlYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtcmVxdWVzdCAoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICB1cmw6IGFyZ3MudXJsLFxuICAgICAgZGF0YTogZGF0YSxcbiAgICB9KVxuICB9O1xuICBtb2RlbC51cGRhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0KHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICB1cmw6IGFyZ3MudXJsICsgXCIvXCIgKyBkYXRhLmlkKCksXG4gICAgICBkYXRhOiBkYXRhLFxuICAgIH0pXG4gIH07XG4gIG1vZGVsLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0KHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgICB1cmw6IGFyZ3MudXJsICsgXCIvXCIgKyBpZCxcbiAgICB9KVxuICB9O1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSl7XG4gIGRhdGEgPSBkYXRhIHx8IHt9O1xuICB0aGlzLmlkID0gbS5wcm9wKGRhdGEuaWQgfHwgMCk7XG4gIHRoaXMudXJpID0gbS5wcm9wKGRhdGEudXJpIHx8ICcnKTtcbn1cbiIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKFwiLi4vaGVscGVycy9tb2RlbFwiKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZShcIi4uL2xheW91dC9zcGlubmVyXCIpO1xudmFyIEltYWdlID0gcmVxdWlyZShcIi4vaW1hZ2VcIik7XG5cbnZhciBJbWFnZUNvbXBvbmVudCA9IHt9O1xuXG4vL2FyZ3M6IHtpbWFnZTogbS5wcm9wKEltYWdlKC4uKSksIGVycm9yOiBtLnByb3AoKSwgb25kZWxldGU6IGNhbGxiYWNrIGZ1bmN0aW9ufVxuSW1hZ2VDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmNzLm1yZXF1ZXN0KHttZXRob2Q6IFwiREVMRVRFXCIsIHVybDogXCIvYXBpL2ltYWdlcy9cIiArIGFyZ3MuaW1hZ2UuaWQoKX0pXG4gICAgICAudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdWNjZXNzKXthcmdzLm9uZGVsZXRlKCk7fSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvcil7YXJncy5lcnJvcihlcnJvcik7fSk7XG4gIH1cbn1cbkltYWdlQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCwgYXJncykge1xuXG4gIHJldHVybiBtKFwiLmltYWdlY29tcG9uZW50LnRodW1ibmFpbFwiLCBcbiAgICAgIG0oJ2ltZycsIHtzcmM6IGFyZ3MuaW1hZ2UudXJpKCl9KSxcbiAgICAgIG0oJ3NwYW4uZmEuZmEtdGltZXMnLCB7b25jbGljazogY3RybC5kZWxldGUsIHRpdGxlOiBcItCj0LTQsNC70LjRgtGMXCJ9KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBJbWFnZSA9IHJlcXVpcmUoJy4vaW1hZ2UnKTtcbnZhciBJbWFnZUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vaW1hZ2Vjb21wb25lbnQnKTtcblxudmFyIEltYWdlc0NvbXBvbmVudCA9IHt9O1xuSW1hZ2VzQ29tcG9uZW50LnZtID0ge307XG5JbWFnZXNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubGlzdCA9IGxpc3Q7XG4gIHJldHVybiB0aGlzO1xufVxuLy9saXN0ID0gYXJyYXkgb2YgSW1hZ2UoKSdzXG5JbWFnZXNDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uIChsaXN0KSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gSW1hZ2VzQ29tcG9uZW50LnZtLmluaXQobGlzdCk7XG4gIGN0cmwudXBkYXRpbmcgPSBtLnByb3AoZmFsc2UpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5vbmRlbGV0ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgY3RybC52bS5saXN0LnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIHZhciBmaWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VwbG9hZF9pbWFnZV9pbnB1dCcpLmZpbGVzWzBdO1xuICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgZGF0YS5hcHBlbmQoJ3VwbG9hZCcsIGZpbGUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1cGxvYWRfaW1hZ2VfaW5wdXQnKS52YWx1ZSA9IFwiXCI7IC8vY2xlYXJcbiAgICBmdW5jcy5tcmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICB1cmw6ICcvYXBpL2ltYWdlcycsIFxuICAgICAgZGF0YTogZGF0YSwgXG4gICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gZGF0YX1cbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICBjdHJsLnZtLmxpc3QucHVzaChuZXcgSW1hZ2Uoc3VjY2VzcykpO1xuICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBjdHJsLmVycm9yKGVycm9yKTtcbiAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICB9KTtcbiAgfVxufVxuSW1hZ2VzQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuICByZXR1cm4gbShcIiNpbWFnZWxpc3RcIiwgXG4gICAgICBtKCcjaW1hZ2VzJywgXG4gICAgICAgIGN0cmwudm0ubGlzdC5tYXAoZnVuY3Rpb24oZGF0YSwgaW5kZXgpe1xuICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChJbWFnZUNvbXBvbmVudCwge2tleTogaW5kZXgsIGltYWdlOiBkYXRhLCBlcnJvcjogY3RybC5lcnJvciwgb25kZWxldGU6IGN0cmwub25kZWxldGUuYmluZChjdHJsLCBpbmRleCl9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIiksXG4gICAgICBtKCcuZmlsZS11cGxvYWQtd3JhcHBlcicsIFxuICAgICAgICBtKCdpbnB1dCN1cGxvYWRfaW1hZ2VfaW5wdXRbdHlwZT1maWxlXScsIHtvbmNoYW5nZTogY3RybC5jcmVhdGV9KSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlc0NvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbGF5b3V0KGNvbXBvbmVudCkge1xuICBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gICAgbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsIFxuICAgICAgdXJsOiBcIi9hcGkvbG9nb3V0XCIsIFxuICAgIH0pLnRoZW4oKHN1Y2Nlc3MpID0+IHt3aW5kb3cubG9jYXRpb24gPSBcIi9cIjt9KVxuICB9XG5cbiAgdmFyIGhlYWRlciA9IG0oXCJuYXYubmF2YmFyLm5hdmJhci1kZWZhdWx0XCIsXG4gICAgICBtKCcubmF2YmFyLWhlYWRlcicsXG4gICAgICAgIG0oJ2J1dHRvbi5uYXZiYXItdG9nZ2xlLmNvbGxhcHNlZFt0eXBlPVwiYnV0dG9uXCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGRhdGEtdGFyZ2V0PVwiI25hdmJhci1jb2xsYXBzZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiXScsXG4gICAgICAgICAgbSgnc3Bhbi5zci1vbmx5JywgXCJUb2dnbGUgbmF2aWdhdGlvblwiKSxcbiAgICAgICAgICBtKCdzcGFuLmljb24tYmFyJyksXG4gICAgICAgICAgbSgnc3Bhbi5pY29uLWJhcicpLFxuICAgICAgICAgIG0oJ3NwYW4uaWNvbi1iYXInKSksXG4gICAgICAgIG0oJ2EubmF2YmFyLWJyYW5kW2hyZWY9XCIjXCJdJywgXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiKSksXG4gICAgICBtKCcuY29sbGFwc2UgbmF2YmFyLWNvbGxhcHNlI25hdmJhci1jb2xsYXBzZScsXG4gICAgICAgIG0oJ3VsLm5hdi5uYXZiYXItbmF2Lm5hdmJhci1yaWdodCcsXG4gICAgICAgICAgbSgnbGknLCBcbiAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9cIl0nLFxuICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsYXknKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsIFwi0KHQsNC50YJcIikpKSxcbiAgICAgICAgICBtKCdsaScsIFxuICAgICAgICAgICAgbSgnYVtocmVmPVwiI1wiXScsIHtvbmNsaWNrOiBsb2dvdXR9LFxuICAgICAgICAgICAgICBtKCdpLmZhLmZhLXNpZ24tb3V0JyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCBcItCS0YvQudGC0LhcIikpKSkpKTtcblxuICB2YXIgbmF2bGluayA9IGZ1bmN0aW9uICh1cmwsIHRpdGxlKSB7XG4gICAgcmV0dXJuIG0oJ2xpJywgeyBjbGFzczogKG0ucm91dGUoKS5pbmNsdWRlcyh1cmwpKSA/IFwiYWN0aXZlXCIgOiBcIlwiIH0sIG0oJ2EnLCB7IGhyZWY6IHVybCwgY29uZmlnOiBtLnJvdXRlIH0sIHRpdGxlKSk7XG4gIH1cbiAgdmFyIHNpZGViYXIgPSBbXG4gICAgbSgnLnBhbmVsLnBhbmVsLWRlZmF1bHQnLFxuICAgICAgICBtKCd1bC5uYXYgbmF2LXBpbGxzIG5hdi1zdGFja2VkJyxcbiAgICAgICAgICBuYXZsaW5rKFwiL2NhdGVnb3JpZXNcIiwgXCLQmtCw0YLQtdCz0L7RgNC40Lgg0YLQvtCy0LDRgNC+0LJcIiksXG4gICAgICAgICAgbmF2bGluayhcIi9wcm9kdWN0c1wiLCBcItCi0L7QstCw0YDRi1wiKSxcbiAgICAgICAgICBuYXZsaW5rKFwiL3BhZ2VzXCIsIFwi0KHRgtGA0LDQvdC40YbRi1wiKSxcbiAgICAgICAgICBuYXZsaW5rKFwiL3VzZXJzXCIsIFwi0J/QvtC70YzQt9C+0LLQsNGC0LXQu9C4XCIpXG4gICAgICAgICApKV07XG5cbiAgcmV0dXJuIFtcbiAgICBoZWFkZXIsXG4gICAgbShcIiNjb250ZW50LXdyYXBwZXJcIixcbiAgICAgICAgbSgnI3NpZGViYXInLCBzaWRlYmFyKSxcbiAgICAgICAgbSgnI2NvbnRlbnQnLCBtLmNvbXBvbmVudChjb21wb25lbnQpKSldO1xufTtcblxuZnVuY3Rpb24gbWl4aW5MYXlvdXQobGF5b3V0LCBjb21wb25lbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbGF5b3V0KGNvbXBvbmVudCk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgcmV0dXJuIHsgY29udHJvbGxlcjogZnVuY3Rpb24gKCkgeyB9LCB2aWV3OiBtaXhpbkxheW91dChsYXlvdXQsIGNvbXBvbmVudCkgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2V0Q29va2llID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIikuc2V0Q29va2llO1xuXG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHt9O1xuXG4vL2FyZyBpcyBhbiBtLnByb3Agb2YgcGFnZXNpemUgaW4gdGhlIHBhcmVudCBjb250cm9sbGVyXG5QYWdlU2l6ZVNlbGVjdG9yLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmcpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBjdHJsLnNldHBhZ2VzaXplID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIGFyZyhzaXplKTtcbiAgICBzZXRDb29raWUoXCJwYWdlc2l6ZVwiLCBzaXplLCAzNjUpOyAvL3N0b3JlIHBhZ2VzaXplIGluIGNvb2tpZXNcbiAgICBtLnJlZHJhdygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cblxuUGFnZVNpemVTZWxlY3Rvci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJnKSB7XG4gIHJldHVybiBtKCcjcGFnZXNpemVzZWxlY3RvcicsXG4gICAgICBtKCdzcGFuJywgXCLQn9C+0LrQsNC30YvQstCw0YLRjCDQvdCwINGB0YLRgNCw0L3QuNGG0LU6IFwiKSxcbiAgICAgIFsxMCwgNTAsIDEwMCwgNTAwXS5tYXAoZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICByZXR1cm4gbSgnYVtocmVmPSNdJywge2NsYXNzOiAoc2l6ZSA9PSBhcmcoKSkgPyAnYWN0aXZlJyA6ICcnLCBvbmNsaWNrOiBjdHJsLnNldHBhZ2VzaXplLmJpbmQodGhpcywgc2l6ZSl9LCBzaXplKVxuICAgICAgfSlcbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlU2l6ZVNlbGVjdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGFnZXMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2Z1bmNzJykucGFnZXM7XG52YXIgUGFnaW5hdG9yID0ge307XG5cblBhZ2luYXRvci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY3RybCA9IHRoaXM7XG4gIGN0cmwuc2V0cGFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgYXJncy5vbnNldHBhZ2UoaW5kZXgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5QYWdpbmF0b3IudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgcmV0dXJuIG0oJyNwYWdpbmF0b3InLCBcbiAgICAgIChhcmdzLmxpc3QoKS5sZW5ndGggPiBhcmdzLnBhZ2VzaXplKCkpXG4gICAgICA/IG0oJ25hdicsXG4gICAgICAgIG0oJ3VsLnBhZ2luYXRpb24nLCBcbiAgICAgICAgICBwYWdlcyhhcmdzLmxpc3QoKS5sZW5ndGgsIGFyZ3MucGFnZXNpemUoKSlcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKHAsIGluZGV4KXtcbiAgICAgICAgICAgIHJldHVybiBtKCdsaScsIHtjbGFzczogKGluZGV4ID09IGFyZ3MuY3VycmVudHBhZ2UoKSkgPyAnYWN0aXZlJyA6ICcnfSwgXG4gICAgICAgICAgICAgICAgKGluZGV4ID09IGFyZ3MuY3VycmVudHBhZ2UoKSlcbiAgICAgICAgICAgICAgICA/IG0oJ3NwYW4nLCBpbmRleCsxKVxuICAgICAgICAgICAgICAgIDogbSgnYVtocmVmPS9dJywge29uY2xpY2s6IGN0cmwuc2V0cGFnZS5iaW5kKHRoaXMsIGluZGV4KX0sIGluZGV4KzEpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgIH0pKSlcbiAgICAgIDogXCJcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9hZGluZ1NwaW5uZXIgPSB7fTtcblxuTG9hZGluZ1NwaW5uZXIuY29udHJvbGxlciA9IGZ1bmN0aW9uKCkge31cbkxvYWRpbmdTcGlubmVyLnZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHJldHVybiBtKCcjbG9hZGluZy1zcGlubmVyLmFuaW1hdGVkLmZhZGVJbicsXG4gICAgICBtKCdwLnRleHQtY2VudGVyJywgbSgnaS5mYS5mYS1zcGluLmZhLWNvZy5mYS0zeCcpKSxcbiAgICAgIG0oJ3AudGV4dC1jZW50ZXInLCAn0J/QvtC00L7QttC00LjRgtC1LCDQuNC00LXRgiDQt9Cw0LPRgNGD0LfQutCwLi4uJykpO1xufVxuXG52YXIgVXBkYXRpbmdTcGlubmVyID0ge307XG5cblVwZGF0aW5nU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge31cblVwZGF0aW5nU3Bpbm5lci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICByZXR1cm4gbSgnI3VwZGF0aW5nLXNwaW5uZXIuYW5pbWF0ZWQuZmFkZUluJyxcbiAgICAgIG0oJ3Ajc3Bpbm5lci10ZXh0JywgbSgnaS5mYS5mYS1zcGluLmZhLWNvZy5mYS0zeCcpKSk7XG59XG5cbnZhciBTcGlubmVyID0ge307XG5TcGlubmVyLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjdHJsID0gdGhpcztcbiAgY3RybC5zdGFuZGFsb25lID0gKGFyZ3MgJiYgYXJncy5zdGFuZGFsb25lKSA/IHRydWUgOiBmYWxzZTtcbn1cblNwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgcmV0dXJuIG0oJyNzcGlubmVyJywgXG4gICAgICAoY3RybC5zdGFuZGFsb25lKSBcbiAgICAgID8gbS5jb21wb25lbnQoTG9hZGluZ1NwaW5uZXIpIFxuICAgICAgOiBtLmNvbXBvbmVudChVcGRhdGluZ1NwaW5uZXIpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGlubmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG5pZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZG1pbi1hcHBcIikpIHtcbiAgdmFyIERhc2hib2FyZENvbXBvbmVudCA9IHJlcXVpcmUoXCIuL2Rhc2hib2FyZFwiKTtcbiAgdmFyIENhdGVnb3JpZXNDb21wb25lbnQgPSByZXF1aXJlKFwiLi9jYXRlZ29yeS9jYXRlZ29yaWVzY29tcG9uZW50XCIpO1xuICB2YXIgQ2F0ZWdvcnlDb21wb25lbnQgPSByZXF1aXJlKFwiLi9jYXRlZ29yeS9jYXRlZ29yeWNvbXBvbmVudFwiKTtcbiAgdmFyIFByb2R1Y3RzQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vcHJvZHVjdC9wcm9kdWN0c2NvbXBvbmVudFwiKTtcbiAgdmFyIFByb2R1Y3RDb21wb25lbnQgPSByZXF1aXJlKFwiLi9wcm9kdWN0L3Byb2R1Y3Rjb21wb25lbnRcIik7XG4gIHZhciBVc2Vyc0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3VzZXIvdXNlcnNjb21wb25lbnRcIik7XG4gIHZhciBVc2VyQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vdXNlci91c2VyY29tcG9uZW50XCIpO1xuICB2YXIgUGFnZXNDb21wb25lbnQgPSByZXF1aXJlKFwiLi9wYWdlL3BhZ2VzY29tcG9uZW50XCIpO1xuICB2YXIgUGFnZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3BhZ2UvcGFnZWNvbXBvbmVudFwiKTtcbiAgdmFyIGxheW91dCA9IHJlcXVpcmUoXCIuL2xheW91dC9sYXlvdXRcIik7XG5cbiAgLy9zZXR1cCByb3V0ZXMgdG8gc3RhcnQgdy8gdGhlIGAjYCBzeW1ib2xcbiAgbS5yb3V0ZS5tb2RlID0gXCJoYXNoXCI7XG5cbiAgbS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkbWluLWFwcFwiKSwgXCIvXCIsIHtcbiAgICBcIi9cIjogbGF5b3V0KERhc2hib2FyZENvbXBvbmVudCksXG4gICAgXCIvdXNlcnNcIjogbGF5b3V0KFVzZXJzQ29tcG9uZW50KSxcbiAgICBcIi91c2Vycy86aWRcIjogbGF5b3V0KFVzZXJDb21wb25lbnQpLFxuICAgIFwiL3BhZ2VzXCI6IGxheW91dChQYWdlc0NvbXBvbmVudCksXG4gICAgXCIvcGFnZXMvOmlkXCI6IGxheW91dChQYWdlQ29tcG9uZW50KSxcbiAgICBcIi9jYXRlZ29yaWVzXCI6IGxheW91dChDYXRlZ29yaWVzQ29tcG9uZW50KSxcbiAgICBcIi9jYXRlZ29yaWVzLzppZFwiOiBsYXlvdXQoQ2F0ZWdvcnlDb21wb25lbnQpLFxuICAgIFwiL3Byb2R1Y3RzXCI6IGxheW91dChQcm9kdWN0c0NvbXBvbmVudCksXG4gICAgXCIvcHJvZHVjdHMvOmlkXCI6IGxheW91dChQcm9kdWN0Q29tcG9uZW50KVxuICB9KTtcbn1cblxuLy9qcXVlcnkgY2FsbGJhY2tzXG4kKGZ1bmN0aW9uKCl7XG4gIC8vbmF2YmFyXG4gICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdGhyZXNob2xkID0gNTA7XG4gICAgaWYoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gdGhyZXNob2xkKXtcbiAgICAgICQoJyNuYXZiYXItbWFpbicpLmFkZENsYXNzKCdzY3JvbGxlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcjbmF2YmFyLW1haW4nKS5yZW1vdmVDbGFzcygnc2Nyb2xsZWQnKTtcbiAgICB9XG4gIH0pO1xuXG5cdC8vdG9wIGxpbmtcblx0JCgnI3RvcC1saW5rJykudG9wTGluayh7XG5cdFx0bWluOiA0MDAsXG5cdFx0ZmFkZVNwZWVkOiA1MDBcblx0fSk7XG5cdC8vc21vb3Roc2Nyb2xsXG5cdCQoJyN0b3AtbGluaycpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0JC5zY3JvbGxUbygwLDMwMCk7XG5cdH0pO1xufSk7XG5cbi8vdG9wbGluayBwbHVnaW5cbmpRdWVyeS5mbi50b3BMaW5rID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0c2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKHtcblx0XHRtaW46IDEsXG5cdFx0ZmFkZVNwZWVkOiAyMDBcblx0fSwgc2V0dGluZ3MpO1xuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdC8vbGlzdGVuIGZvciBzY3JvbGxcblx0XHR2YXIgZWwgPSAkKHRoaXMpO1xuXHRcdGVsLmhpZGUoKTsgLy9pbiBjYXNlIHRoZSB1c2VyIGZvcmdvdFxuXHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZigkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPj0gc2V0dGluZ3MubWluKVxuXHRcdFx0e1xuXHRcdFx0XHRlbC5mYWRlSW4oc2V0dGluZ3MuZmFkZVNwZWVkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0ZWwuZmFkZU91dChzZXR0aW5ncy5mYWRlU3BlZWQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKXtcbiAgZGF0YSA9IGRhdGEgfHwge307XG4gIHRoaXMuaWQgPSBtLnByb3AoZGF0YS5pZCB8fCAwKTtcbiAgdGhpcy5uYW1lID0gbS5wcm9wKGRhdGEubmFtZSB8fCAnJyk7XG4gIHRoaXMuc2x1ZyA9IG0ucHJvcChkYXRhLnNsdWcgfHwgJycpO1xuICB0aGlzLmNvbnRlbnQgPSBtLnByb3AoZGF0YS5jb250ZW50IHx8ICcnKTtcbiAgdGhpcy5wdWJsaXNoZWQgPSBtLnByb3AoZGF0YS5wdWJsaXNoZWQgfHwgdHJ1ZSk7XG4gIHRoaXMubWV0YV9kZXNjcmlwdGlvbiA9IG0ucHJvcChkYXRhLm1ldGFfZGVzY3JpcHRpb24gfHwgJycpO1xuICB0aGlzLm1ldGFfa2V5d29yZHMgPSBtLnByb3AoZGF0YS5tZXRhX2tleXdvcmRzIHx8ICcnKTtcbn1cbiIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL21vZGVsJyk7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoJy4uL2xheW91dC9zcGlubmVyJyk7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoJy4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yJyk7XG52YXIgUGFnaW5hdG9yID0gcmVxdWlyZSgnLi4vbGF5b3V0L3BhZ2luYXRvcicpO1xudmFyIFBhZ2UgPSByZXF1aXJlKCcuL3BhZ2UnKTtcbnZhciBFZGl0b3IgPSByZXF1aXJlKCcuLi9lZGl0b3IvZWRpdG9yY29tcG9uZW50Jyk7XG5cblxudmFyIFBhZ2VDb21wb25lbnQgPSB7fTtcblBhZ2VDb21wb25lbnQudm0gPSB7fTtcblBhZ2VDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvcGFnZXNcIiwgdHlwZTogUGFnZX0pO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICB2bS5yZWNvcmQgPSBtLnByb3AobmV3IFBhZ2UoKSk7XG4gIH0gZWxzZSB7XG4gICAgdm0ucmVjb3JkID0gIHZtLm1vZGVsLmdldChtLnJvdXRlLnBhcmFtKFwiaWRcIikpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuUGFnZUNvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgY3RybC52bSA9IFBhZ2VDb21wb25lbnQudm0uaW5pdCgpO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKTtcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCh0L7Qt9C00LDQvdC40LUg0YHRgtGA0LDQvdC40YbRi1wiO1xuICB9IGVsc2Uge1xuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICAgIGN0cmwudm0ucmVjb3JkLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YDRgtC+0YfQutCwINGB0YLRgNCw0L3QuNGG0YtcIjtcbiAgfVxuICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcbiAgY3RybC5tZXNzYWdlID0gbS5wcm9wKCcnKTsgLy9ub3RpZmljYXRpb25zXG5cbiAgY3RybC5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICBtLnJvdXRlKFwiL3BhZ2VzXCIpO1xuICB9XG4gIGN0cmwudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC5tZXNzYWdlKCcnKTtcbiAgICBjdHJsLmVycm9yKCcnKTtcbiAgICBjdHJsLnZtLm1vZGVsLnVwZGF0ZShjdHJsLnZtLnJlY29yZCgpKVxuICAgICAgLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge2N0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO30sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTt9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KTtcbiAgfVxuICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC52bS5yZWNvcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHttLnJvdXRlKFwiL3BhZ2VzXCIpO30sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC5lcnJvcihmdW5jcy5wYXJzZUVycm9yKGVycm9yKSk7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7IFxuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH0pO1xuICB9XG59XG5QYWdlQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNwYWdlY29tcG9uZW50XCIsXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBjdHJsLnZtLnJlY29yZCgpXG4gICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJyxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9CX0LDQs9C+0LvQvtCy0L7QuicpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5uYW1lKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5uYW1lKX0pKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ch0L7QtNC10YDQttCw0L3QuNC1JyksXG4gICAgICAgICAgbS5jb21wb25lbnQoRWRpdG9yLCB7dGV4dDogY3RybC52bS5yZWNvcmQoKS5jb250ZW50fSkpLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JzQtdGC0LAg0L7Qv9C40YHQsNC90LjQtScpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5tZXRhX2Rlc2NyaXB0aW9uKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5tZXRhX2Rlc2NyaXB0aW9uKX0pKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cc0LXRgtCwINC60LvRjtGH0LXQstC40LrQuCcpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5tZXRhX2tleXdvcmRzKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5tZXRhX2tleXdvcmRzKX0pKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ce0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywge2NoZWNrZWQ6IGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKCksIG9uY2xpY2s6IG0ud2l0aEF0dHIoXCJjaGVja2VkXCIsIGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKX0pKSxcbiAgICAgICAgKGN0cmwubWVzc2FnZSgpKSA/IG0oJy5hY3Rpb24tbWVzc2FnZS5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwubWVzc2FnZSgpKSA6IFwiXCIsXG4gICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxuICAgICAgICBtKCcuYWN0aW9ucycsXG4gICAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKVxuICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LFxuICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0LfQtNCw0YLRjCcpKVxuICAgICAgICAgIDogW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC51cGRhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSxcbiAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJykpLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tZGFuZ2VyJywgeyBvbmNsaWNrOiBjdHJsLmNhbmNlbCB9LFxuICAgICAgICAgICAgbSgnaS5mYS5mYS10aW1lcycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQntGC0LzQtdC90LAnKSkpKVxuICAgICAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2VDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIFBhZ2UgPSByZXF1aXJlKFwiLi9wYWdlXCIpO1xuXG52YXIgUGFnZXNDb21wb25lbnQgPSB7fTtcblBhZ2VzQ29tcG9uZW50LnZtID0ge307XG5QYWdlc0NvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3BhZ2VzXCIsIHR5cGU6IFBhZ2V9KTtcbiAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KCk7XG4gIHJldHVybiB0aGlzO1xufVxuUGFnZXNDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBQYWdlc0NvbXBvbmVudC52bS5pbml0KCk7XG4gIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC/0LjRgdC+0Log0YHRgtGA0LDQvdC40YZcIjtcbiAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChmdW5jcy5nZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCk7IC8vbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlXG4gIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCk7IC8vY3VycmVudCBwYWdlLCBzdGFydGluZyB3aXRoIDBcbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5lZGl0ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9wYWdlcy9cIityb3cuaWQoKSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL3BhZ2VzL25ld1wiKTtcbiAgfVxuICBjdHJsLnNob3cgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy9wcmV2ZW50IHRyLm9uY2xpY2sgdHJpZ2dlclxuICAgIHdpbmRvdy5sb2NhdGlvbiA9IFwiL3BhZ2UvXCIgKyByb3cuaWQoKSArIFwiLVwiICsgcm93LnNsdWcoKTtcbiAgfVxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKTtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gZnVuY3MucGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbn1cblBhZ2VzQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG0oJ3RyLmNsaWNrYWJsZScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXG4gICAgICAgIG0oJ3RkJywgZGF0YS5uYW1lKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLnB1Ymxpc2hlZCgpID8gbSgnaS5mYS5mYS1jaGVjaycpIDogbSgnaS5mYS5mYS10aW1lcycpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCf0YDQvtGB0LzQvtGC0YBdJywge29uY2xpY2s6IGN0cmwuc2hvdy5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1leWUnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRhbmdlclt0aXRsZT3Qo9C00LDQu9C40YLRjF0nLCB7b25jbGljazogY3RybC5kZWxldGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcmVtb3ZlJykpXG4gICAgICAgICApKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNwYWdlc2NvbXBvbmVudFwiLFxuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JyxcbiAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBmdW5jcy5zb3J0cyhjdHJsLnZtLmxpc3QoKSksXG4gICAgICAgICAgbSgndGhlYWQnLCBcbiAgICAgICAgICAgIG0oJ3RyJyxcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQl9Cw0LPQvtC70L7QstC+0LonKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9cHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90L4nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpKSksXG4gICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICA/IFtcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAuc2xpY2UoY3RybC5jdXJyZW50cGFnZSgpKmN0cmwucGFnZXNpemUoKSwgKGN0cmwuY3VycmVudHBhZ2UoKSsxKSpjdHJsLnBhZ2VzaXplKCkpXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICByZXR1cm4gc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICghY3RybC52bS5saXN0KCkubGVuZ3RoKSBcbiAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxuICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgY3RybC51cGRhdGluZygpID8gbS5jb21wb25lbnQoU3Bpbm5lcikgOiBcIlwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIpXG4gICAgICAgICAgICkpLFxuICAgICAgICAgIG0oJy5hY3Rpb25zJyxcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5jcmVhdGUgfSxcbiAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcbiAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0YHRgtGA0LDQvdC40YbRgycpKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSkpLFxuICAgICAgICAgIGN0cmwudm0ubGlzdCgpID8gbS5jb21wb25lbnQoUGFnaW5hdG9yLCB7bGlzdDogY3RybC52bS5saXN0LCBwYWdlc2l6ZTogY3RybC5wYWdlc2l6ZSwgY3VycmVudHBhZ2U6IGN0cmwuY3VycmVudHBhZ2UsIG9uc2V0cGFnZTogY3RybC5jdXJyZW50cGFnZX0pIDogXCJcIikpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2VzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW1hZ2UgPSByZXF1aXJlKCcuLi9pbWFnZS9pbWFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5zbHVnID0gbS5wcm9wKGRhdGEuc2x1ZyB8fCAnJyk7XG4gIHRoaXMuY29udGVudCA9IG0ucHJvcChkYXRhLmNvbnRlbnQgfHwgJycpO1xuICB0aGlzLmltYWdlID0gbS5wcm9wKGRhdGEuaW1hZ2UgfHwgJycpO1xuICB0aGlzLnB1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLnB1Ymxpc2hlZCB8fCB0cnVlKTtcbiAgdGhpcy5wcmljZSA9IG0ucHJvcChkYXRhLnByaWNlIHx8IG51bGwpO1xuICB0aGlzLmNhdGVnb3J5X25hbWUgPSBtLnByb3AoKGRhdGEuY2F0ZWdvcnkpID8gZGF0YS5jYXRlZ29yeS5uYW1lIDogJycpO1xuICB0aGlzLmNhdGVnb3J5X2lkID0gbS5wcm9wKGRhdGEuY2F0ZWdvcnlfaWQgfHwgMCk7XG4gIHRoaXMubWV0YV9kZXNjcmlwdGlvbiA9IG0ucHJvcChkYXRhLm1ldGFfZGVzY3JpcHRpb24gfHwgJycpO1xuICB0aGlzLm1ldGFfa2V5d29yZHMgPSBtLnByb3AoZGF0YS5tZXRhX2tleXdvcmRzIHx8ICcnKTtcbiAgZGF0YS5pbWFnZXMgPSBkYXRhLmltYWdlcyB8fCBbXTtcbiAgdGhpcy5pbWFnZXMgPSBkYXRhLmltYWdlcy5tYXAoZnVuY3Rpb24oaW1nKXtcbiAgICByZXR1cm4gbmV3IEltYWdlKGltZyk7XG4gIH0pO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBDYXRlZ29yeVNlbGVjdCA9IHJlcXVpcmUoXCIuLi9jYXRlZ29yeS9jYXRlZ29yeXNlbGVjdFwiKTtcbnZhciBQcm9kdWN0ID0gcmVxdWlyZShcIi4vcHJvZHVjdFwiKTtcbnZhciBFZGl0b3IgPSByZXF1aXJlKCcuLi9lZGl0b3IvZWRpdG9yY29tcG9uZW50Jyk7XG52YXIgSW1hZ2VzQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW1hZ2UvaW1hZ2VzY29tcG9uZW50Jyk7XG5cbnZhciBQcm9kdWN0Q29tcG9uZW50ID0ge307XG5Qcm9kdWN0Q29tcG9uZW50LnZtID0ge307XG5Qcm9kdWN0Q29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3Byb2R1Y3RzXCIsIHR5cGU6IFByb2R1Y3R9KTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgdm0ucmVjb3JkID0gbS5wcm9wKG5ldyBQcm9kdWN0KCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblByb2R1Y3RDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBQcm9kdWN0Q29tcG9uZW50LnZtLmluaXQoKTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcChmYWxzZSk7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC+0LfQtNCw0L3QuNC1INGC0L7QstCw0YDQsFwiO1xuICB9IGVsc2Uge1xuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICAgIGN0cmwudm0ucmVjb3JkLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YDRgtC+0YfQutCwINGC0L7QstCw0YDQsFwiO1xuICB9XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpOyAvL25vdGlmaWNhdGlvbnNcblxuICBjdHJsLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIG0ucm91dGUoXCIvcHJvZHVjdHNcIik7XG4gIH1cbiAgY3RybC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwudm0ucmVjb3JkKCkpXG4gICAgICAudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7Y3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyk7fSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvcikge2N0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO30pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKX0pO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC5tZXNzYWdlKCcnKTtcbiAgICBjdHJsLmVycm9yKCcnKTtcbiAgICBjdHJsLnZtLm1vZGVsLmNyZWF0ZShjdHJsLnZtLnJlY29yZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge20ucm91dGUoXCIvcHJvZHVjdHNcIik7fSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfSk7XG4gIH1cbn1cblByb2R1Y3RDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgLy9jb21wbGV0ZSB2aWV3XG4gIHJldHVybiBtKFwiI3Byb2R1Y3Rjb21wb25lbnRcIixcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIGN0cmwudm0ucmVjb3JkKClcbiAgICAgID8gbSgnZm9ybS5hbmltYXRlZC5mYWRlSW4nLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J3QsNC30LLQsNC90LjQtScpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5uYW1lKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5uYW1lKX0pKSxcbiAgICAgICAgbSgnLnJvdycsXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAgY29sLXNtLTYnLFxuICAgICAgICAgICAgbSgnbGFiZWwnLCAn0JrQsNGC0LXQs9C+0YDQuNGPJyksXG4gICAgICAgICAgICBtLmNvbXBvbmVudChDYXRlZ29yeVNlbGVjdCwge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmNhdGVnb3J5X2lkLCBlcnJvcjogY3RybC5lcnJvcn0pKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCBjb2wtc20tNicsXG4gICAgICAgICAgICBtKCdsYWJlbCcsICfQptC10L3QsCcpLFxuICAgICAgICAgICAgbSgnLmlucHV0LWdyb3VwJyxcbiAgICAgICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9bnVtYmVyXVtzdGVwPTAuMDFdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLnByaWNlKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5wcmljZSl9KSxcbiAgICAgICAgICAgICAgbSgnc3Bhbi5pbnB1dC1ncm91cC1hZGRvbicsICfRgC4nKSkpKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ch0L7QtNC10YDQttCw0L3QuNC1JyksXG4gICAgICAgICAgbS5jb21wb25lbnQoRWRpdG9yLCB7dGV4dDogY3RybC52bS5yZWNvcmQoKS5jb250ZW50fSkpLFxuICAgICAgICBtKCcuZm9ybS1ncm91cC5vdXRsaW5lJyxcbiAgICAgICAgICBtKCdsYWJlbCcsICfQpNC+0YLQvtCz0YDQsNGE0LjQuCcpLFxuICAgICAgICAgIG0uY29tcG9uZW50KEltYWdlc0NvbXBvbmVudCwgY3RybC52bS5yZWNvcmQoKS5pbWFnZXMpKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cc0LXRgtCwINC+0L/QuNGB0LDQvdC40LUnKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkubWV0YV9kZXNjcmlwdGlvbigpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkubWV0YV9kZXNjcmlwdGlvbil9KSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cc0LXRgtCwINC60LvRjtGH0LXQstC40LrQuCcpLFxuICAgICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm1ldGFfa2V5d29yZHMoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm1ldGFfa2V5d29yZHMpfSkpLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKCdsYWJlbCcsICfQntC/0YPQsdC70LjQutC+0LLQsNGC0YwnKSxcbiAgICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywge2NoZWNrZWQ6IGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKCksIG9uY2xpY2s6IG0ud2l0aEF0dHIoXCJjaGVja2VkXCIsIGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKX0pKSxcbiAgICAgICAgKGN0cmwubWVzc2FnZSgpKSA/IG0oJy5hY3Rpb24tbWVzc2FnZS5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwubWVzc2FnZSgpKSA6IFwiXCIsXG4gICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxuICAgICAgICBtKCcuYWN0aW9ucycsXG4gICAgICAgICAgICAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpXG4gICAgICAgICAgICA/IG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC5jcmVhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSxcbiAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7Qt9C00LDRgtGMJykpXG4gICAgICAgICAgICA6IFtcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC51cGRhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSxcbiAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7RhdGA0LDQvdC40YLRjCcpXG4gICAgICAgICAgICAgKV0sXG4gICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1kYW5nZXInLCB7IG9uY2xpY2s6IGN0cmwuY2FuY2VsIH0sXG4gICAgICAgICAgICAgIG0oJ2kuZmEuZmEtdGltZXMnKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsICfQntGC0LzQtdC90LAnKSkpKVxuICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyLCB7c3RhbmRhbG9uZTogdHJ1ZX0pKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9kdWN0Q29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBQcm9kdWN0ID0gcmVxdWlyZShcIi4vcHJvZHVjdFwiKTtcblxudmFyIFByb2R1Y3RzQ29tcG9uZW50ID0ge307XG5Qcm9kdWN0c0NvbXBvbmVudC52bSA9IHt9O1xuUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wcm9kdWN0c1wiLCB0eXBlOiBQcm9kdWN0fSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cblByb2R1Y3RzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZnVuY3MuZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuc2hvdyA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgd2luZG93LmxvY2F0aW9uID0gXCIvcHJvZHVjdC9cIiArIHJvdy5pZCgpICsgXCItXCIgKyByb3cuc2x1ZygpO1xuICB9XG4gIGN0cmwuZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvcHJvZHVjdHMvXCIrcm93LmlkKCkpO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9wcm9kdWN0cy9uZXdcIik7XG4gIH1cbiAgY3RybC5kZWxldGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KCk7XG4gICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjdHJsLmN1cnJlbnRwYWdlKCkrMSA+IGZ1bmNzLnBhZ2VzKGN0cmwudm0ubGlzdCgpLmxlbmd0aCwgY3RybC5wYWdlc2l6ZSgpKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY3RybC5jdXJyZW50cGFnZShNYXRoLm1heChjdHJsLmN1cnJlbnRwYWdlKCktMSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH0pO1xuICB9XG59XG5Qcm9kdWN0c0NvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LFxuICAgICAgICBtKCd0ZC5zaHJpbmsnLCAoZGF0YS5pbWFnZSgpKSA/IG0oJ2ltZy5pbWFnZS1wcmV2aWV3LmltZy1yZXNwb25zaXZlJywge3NyYzogZGF0YS5pbWFnZSgpfSkgOiBcIlwiKSxcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuY2F0ZWdvcnlfbmFtZSgpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLnRleHQtY2VudGVyJywgZGF0YS5wdWJsaXNoZWQoKSA/IG0oJ2kuZmEuZmEtY2hlY2snKSA6IG0oJ2kuZmEuZmEtdGltZXMnKSksXG4gICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJyxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXBlbmNpbCcpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3Qn9GA0L7RgdC80L7RgtGAXScsIHtvbmNsaWNrOiBjdHJsLnNob3cuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtZXllJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKSkpO1xuICB9IC8vc2hvd1Jvd1RlbXBsYXRlXG5cbiAgLy9jb21wbGV0ZSB2aWV3XG4gIHJldHVybiBtKFwiI3Byb2R1Y3RsaXN0XCIsXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBtKCdkaXYnLFxuICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIGZ1bmNzLnNvcnRzKGN0cmwudm0ubGlzdCgpKSxcbiAgICAgICAgICBtKCd0aGVhZCcsIFxuICAgICAgICAgICAgbSgndHInLFxuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWltYWdlXScsICfQpNC+0YLQvicpLFxuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PW5hbWVdJywgJ9Cd0LDQt9Cy0LDQvdC40LUnKSxcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1jYXRlZ29yeV9uYW1lXScsICfQmtCw0YLQtdCz0L7RgNC40Y8nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9cHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpKSksXG4gICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICA/IFtcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAuc2xpY2UoY3RybC5jdXJyZW50cGFnZSgpKmN0cmwucGFnZXNpemUoKSwgKGN0cmwuY3VycmVudHBhZ2UoKSsxKSpjdHJsLnBhZ2VzaXplKCkpXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICByZXR1cm4gc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICghY3RybC52bS5saXN0KCkubGVuZ3RoKSBcbiAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxuICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgY3RybC51cGRhdGluZygpID8gbS5jb21wb25lbnQoU3Bpbm5lcikgOiBcIlwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIpKSksXG4gICAgICAgICAgbSgnLmFjdGlvbnMnLFxuICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5JywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSB9LFxuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDRgtC+0LLQsNGAJykpLFxuICAgICAgICAgICAgICBtKCcucHVsbC1yaWdodCcsIG0uY29tcG9uZW50KFBhZ2VTaXplU2VsZWN0b3IsIGN0cmwucGFnZXNpemUpKSksXG4gICAgICAgICAgY3RybC52bS5saXN0KCkgPyBtLmNvbXBvbmVudChQYWdpbmF0b3IsIHtsaXN0OiBjdHJsLnZtLmxpc3QsIHBhZ2VzaXplOiBjdHJsLnBhZ2VzaXplLCBjdXJyZW50cGFnZTogY3RybC5jdXJyZW50cGFnZSwgb25zZXRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlfSkgOiBcIlwiKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZHVjdHNDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSl7XG4gIGRhdGEgPSBkYXRhIHx8IHt9O1xuICB0aGlzLmlkID0gbS5wcm9wKGRhdGEuaWQgfHwgMCk7XG4gIHRoaXMubmFtZSA9IG0ucHJvcChkYXRhLm5hbWUgfHwgJycpO1xuICB0aGlzLmVtYWlsID0gbS5wcm9wKGRhdGEuZW1haWwgfHwgJycpO1xuICB0aGlzLmN1cnJlbnRfcGFzc3dvcmQgPSBtLnByb3AoZGF0YS5jdXJyZW50X3Bhc3N3b3JkIHx8ICcnKTtcbiAgdGhpcy5wYXNzd29yZCA9IG0ucHJvcChkYXRhLnBhc3N3b3JkIHx8ICcnKTtcbiAgdGhpcy5wYXNzd29yZF9jb25maXJtID0gbS5wcm9wKGRhdGEucGFzc3dvcmRfY29uZmlybSB8fCAnJyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIFVzZXIgPSByZXF1aXJlKCcuL3VzZXInKTtcblxudmFyIFVzZXJDb21wb25lbnQgPSB7fTtcblVzZXJDb21wb25lbnQudm0gPSB7fTtcblVzZXJDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvdXNlcnNcIiwgdHlwZTogVXNlcn0pO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICB2bS5yZWNvcmQgPSBtLnByb3AobmV3IFVzZXIoKSk7XG4gIH0gZWxzZSB7XG4gICAgdm0ucmVjb3JkID0gIHZtLm1vZGVsLmdldChtLnJvdXRlLnBhcmFtKFwiaWRcIikpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuVXNlckNvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgY3RybC52bSA9IFVzZXJDb21wb25lbnQudm0uaW5pdCgpO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKTtcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCh0L7Qt9C00LDQvdC40LUg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXCI7XG4gIH0gZWxzZSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gICAgY3RybC52bS5yZWNvcmQudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgNGC0L7Rh9C60LAg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXCI7XG4gIH1cbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG4gIGN0cmwubWVzc2FnZSA9IG0ucHJvcCgnJyk7IC8vbm90aWZpY2F0aW9uc1xuXG4gIGN0cmwuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgbS5yb3V0ZShcIi91c2Vyc1wiKTtcbiAgfVxuICBjdHJsLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC51cGRhdGUoY3RybC52bS5yZWNvcmQoKSlcbiAgICAgIC50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtjdHJsLm1lc3NhZ2UoJ9CY0LfQvNC10L3QtdC90LjRjyDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnKTt9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7Y3RybC5lcnJvcihmdW5jcy5wYXJzZUVycm9yKGVycm9yKSk7fVxuICAgICAgICAgICkudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKX0pO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC5tZXNzYWdlKCcnKTtcbiAgICBjdHJsLmVycm9yKCcnKTtcbiAgICBjdHJsLnZtLm1vZGVsLmNyZWF0ZShjdHJsLnZtLnJlY29yZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2VzcykgeyBtLnJvdXRlKFwiL3VzZXJzXCIpO30sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC5lcnJvcihmdW5jcy5wYXJzZUVycm9yKGVycm9yKSk7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7IFxuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgKTtcbiAgfVxufVxuVXNlckNvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjdXNlclwiLFxuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgY3RybC52bS5yZWNvcmQoKVxuICAgICAgPyBtKCdmb3JtLmFuaW1hdGVkLmZhZGVJbicsXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICBtKCdsYWJlbCcsICfQmNC80Y8nKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkubmFtZSgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkubmFtZSl9KSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICBtKCdsYWJlbCcsICfQrdC7LiDQv9C+0YfRgtCwJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9ZW1haWxdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmVtYWlsKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5lbWFpbCl9KSksXG4gICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgIT0gXCJuZXdcIilcbiAgICAgICAgPyBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0KLQtdC60YPRidC40Lkg0L/QsNGA0L7Qu9GMJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9cGFzc3dvcmRdJywge3BsYWNlaG9sZGVyOiBcItCe0YHRgtCw0LLRjNGC0LUg0L/Rg9GB0YLRi9C8LCDRh9GC0L7QsdGLINGB0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQuSDQv9Cw0YDQvtC70YxcIiwgdmFsdWU6IGN0cmwudm0ucmVjb3JkKCkuY3VycmVudF9wYXNzd29yZCgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkuY3VycmVudF9wYXNzd29yZCl9KSkgXG4gICAgICAgIDogXCJcIixcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cd0L7QstGL0Lkg0L/QsNGA0L7Qu9GMJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9cGFzc3dvcmRdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLnBhc3N3b3JkKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5wYXNzd29yZCl9KSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICBtKCdsYWJlbCcsICfQn9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtSDQv9Cw0YDQvtC70Y8nKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2xbdHlwZT1wYXNzd29yZF0nLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkucGFzc3dvcmRfY29uZmlybSgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkucGFzc3dvcmRfY29uZmlybSl9KSksXG4gICAgICAgIChjdHJsLm1lc3NhZ2UoKSkgPyBtKCcuYWN0aW9uLW1lc3NhZ2UuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLm1lc3NhZ2UoKSkgOiBcIlwiLFxuICAgICAgICAoY3RybC5lcnJvcigpKSA/IG0oJy5hY3Rpb24tYWxlcnQuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLmVycm9yKCkpIDogXCJcIixcbiAgICAgICAgbSgnLmFjdGlvbnMnLFxuICAgICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIilcbiAgICAgICAgICA/IG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC5jcmVhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSxcbiAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtC30LTQsNGC0YwnKSlcbiAgICAgICAgICA6IFsgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLnVwZGF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LFxuICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0YXRgNCw0L3QuNGC0YwnKSkgXSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1kYW5nZXInLCB7IG9uY2xpY2s6IGN0cmwuY2FuY2VsIH0sXG4gICAgICAgICAgICBtKCdpLmZhLmZhLXRpbWVzJyksXG4gICAgICAgICAgICBtKCdzcGFuJywgJ9Ce0YLQvNC10L3QsCcpKSkpXG4gICAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lciwge3N0YW5kYWxvbmU6IHRydWV9KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlckNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKFwiLi4vaGVscGVycy9tb2RlbFwiKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZShcIi4uL2xheW91dC9zcGlubmVyXCIpO1xudmFyIFBhZ2VTaXplU2VsZWN0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3JcIik7XG52YXIgUGFnaW5hdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdpbmF0b3JcIik7XG52YXIgVXNlciA9IHJlcXVpcmUoXCIuL3VzZXJcIik7XG5cbnZhciBVc2Vyc0NvbXBvbmVudCA9IHt9O1xuVXNlcnNDb21wb25lbnQudm0gPSB7fTtcblVzZXJzQ29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gIGFyZ3MgPSBhcmdzIHx8IHt9O1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvdXNlcnNcIiwgdHlwZTogVXNlcn0pO1xuICB2bS5saXN0ID0gdm0ubW9kZWwuaW5kZXgoKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5Vc2Vyc0NvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgY3RybC52bSA9IFVzZXJzQ29tcG9uZW50LnZtLmluaXQoKTtcbiAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpO30pOyAvL2hpZGUgc3Bpbm5lciBhbmQgcmVkcmF3IGFmdGVyIGRhdGEgYXJyaXZlIFxuICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCh0L/QuNGB0L7QuiDQv9C+0LvRjNC30L7QstCw0YLQtdC70LXQuVwiO1xuICBjdHJsLnBhZ2VzaXplID0gbS5wcm9wKGZ1bmNzLmdldENvb2tpZShcInBhZ2VzaXplXCIpIHx8IDEwKTsgLy9udW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2VcbiAgY3RybC5jdXJyZW50cGFnZSA9IG0ucHJvcCgwKTsgLy9jdXJyZW50IHBhZ2UsIHN0YXJ0aW5nIHdpdGggMFxuICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICBjdHJsLmVkaXQgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL3VzZXJzL1wiK3Jvdy5pZCgpKTtcbiAgfVxuICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvdXNlcnMvbmV3XCIpO1xuICB9XG4gIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy9wcmV2ZW50IHRyLm9uY2xpY2sgdHJpZ2dlclxuICAgIGN0cmwudm0ubW9kZWwuZGVsZXRlKHJvdy5pZCgpKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpO1xuICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY3RybC5jdXJyZW50cGFnZSgpKzEgPiBmdW5jcy5wYWdlcyhjdHJsLnZtLmxpc3QoKS5sZW5ndGgsIGN0cmwucGFnZXNpemUoKSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGN0cmwuY3VycmVudHBhZ2UoTWF0aC5tYXgoY3RybC5jdXJyZW50cGFnZSgpLTEsIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9KTtcbiAgfVxufVxuVXNlcnNDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgdmFyIHNob3dSb3dUZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbSgndHIuY2xpY2thYmxlJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgbSgndGQnLCBkYXRhLmVtYWlsKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJyxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXBlbmNpbCcpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGFuZ2VyW3RpdGxlPdCj0LTQsNC70LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmRlbGV0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1yZW1vdmUnKSkpKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiN1c2VybGlzdFwiLFxuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JyxcbiAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBmdW5jcy5zb3J0cyhjdHJsLnZtLmxpc3QoKSksXG4gICAgICAgICAgbSgndGhlYWQnLCBcbiAgICAgICAgICAgIG0oJ3RyJyxcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1lbWFpbF0nLCAn0K3Quy4g0L/QvtGH0YLQsCcpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQmNC80Y8nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpKSksXG4gICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICA/IFtcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAuc2xpY2UoY3RybC5jdXJyZW50cGFnZSgpKmN0cmwucGFnZXNpemUoKSwgKGN0cmwuY3VycmVudHBhZ2UoKSsxKSpjdHJsLnBhZ2VzaXplKCkpXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICByZXR1cm4gc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICghY3RybC52bS5saXN0KCkubGVuZ3RoKSBcbiAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxuICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgY3RybC51cGRhdGluZygpID8gbS5jb21wb25lbnQoU3Bpbm5lcikgOiBcIlwiXG4gICAgICAgICAgICBdIDogbS5jb21wb25lbnQoU3Bpbm5lcikpKSwgXG4gICAgICAgICAgbSgnLmFjdGlvbnMnLFxuICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5JywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSB9LFxuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8nKSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVc2Vyc0NvbXBvbmVudDtcbiJdfQ==
