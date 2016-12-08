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
        }
        );
  }
}
CategoriesComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        [
        m('td', data.name()),
        m('td.shrink.text-center', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-default[title=Просмотр]', {onclick: ctrl.show.bind(this, data)}, m('i.fa.fa-eye')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
        ])
        ]
        );
  } //showRowTemplate

  //complete view
  return m("#categorylist", [
      m("h1", ctrl.title),
      m('div', [
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()), [
          m('thead', 
            m('tr', [
              m('th.clickable[data-sort-by=name]', 'Название'),
              m('th.shrink.clickable[data-sort-by=published]', 'Опубликована'),
              m('th.shrink.actions', '#')
            ])
           ),
          m('tbody', 
            ctrl.vm.list()
            //if record list is ready, else show spinner
            ? [
            //slice filters records from current page only
            ctrl.vm.list()
            .slice(ctrl.currentpage()*ctrl.pagesize(), (ctrl.currentpage()+1)*ctrl.pagesize())
            .map(function(data){
              return showRowTemplate(data)
            }
            ),
            (!ctrl.vm.list().length) 
            ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.'))
            : "",
            ctrl.updating() ? m.component(Spinner) : ""
            ]
            : m.component(Spinner)
           ), //tbody
          ]), //table
          m('.actions', [
              m('button.btn.btn-primary', { onclick: ctrl.create }, [
                m('i.fa.fa-plus'),
                m('span', 'Добавить категорию')
              ]),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))
          ]),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : "",
          ])
            ]);
}

module.exports = CategoriesComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./category":2}],2:[function(require,module,exports){
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
        function(success) {m.route("/categories");},
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        });
  }
}
CategoryComponent.view = function (ctrl) {

  //complete view
  return m("#categorycomponent", [
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn', [
        m('.form-group', [
          m('label', 'Название'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})
        ]),
        m('.form-group', [
          m('label', 'Описание'),
          m.component(Editor, {text: ctrl.vm.record().content})
        ]),
        m('.form-group', [
          m('label', 'Мета описание'),
          m('input.form-control', {value: ctrl.vm.record().meta_description(), onchange: m.withAttr("value", ctrl.vm.record().meta_description)})
        ]),
        m('.form-group', [
          m('label', 'Мета ключевики'),
          m('input.form-control', {value: ctrl.vm.record().meta_keywords(), onchange: m.withAttr("value", ctrl.vm.record().meta_keywords)})
        ]),
        m('.form-group', [
          m('label', 'Опубликовать'),
          m('input[type=checkbox]', {checked: ctrl.vm.record().published(), onclick: m.withAttr("checked", ctrl.vm.record().published)})
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
          m('button.btn.btn-danger', { onclick: ctrl.cancel }, [
            m('i.fa.fa-times'),
            m('span', 'Отмена')
          ])
        ])
      ])
      : m.component(Spinner, {standalone: true})
    ]);
}

module.exports = CategoryComponent;

},{"../editor/editorcomponent":6,"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./category":2}],4:[function(require,module,exports){
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
  : ""
  );
}

module.exports = CategorySelect;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./category":2}],5:[function(require,module,exports){
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

function layout(component) {
  function logout() {
    m.request({
      method: "POST", 
      url: "/api/logout", 
    }).then((success) => {window.location = "/";})
  }

  var header = m("nav.navbar.navbar-default", [
      m('.navbar-header', [
        m('button.navbar-toggle.collapsed[type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false"]', [
          m('span.sr-only', "Toggle navigation"),
          m('span.icon-bar'),
          m('span.icon-bar'),
          m('span.icon-bar')
        ]),
        m('a.navbar-brand[href="#"]', "Панель администратора")
      ]),
      m('.collapse navbar-collapse#navbar-collapse', [
        m('ul.nav.navbar-nav.navbar-right', [
          m('li', 
            m('a[href="/"]', [
              m('i.fa.fa-play'),
              m('span', "Сайт")
            ])
           ),
          m('li', 
            m('a[href="#"]', {onclick: logout}, [
              m('i.fa.fa-sign-out'),
              m('span', "Выйти")
            ])
           )
        ])
      ])
        ]);

  var navlink = function (url, title) {
    return m('li', { class: (m.route().includes(url)) ? "active" : "" }, m('a', { href: url, config: m.route }, title));
  }
  var sidebar = [
    m('.panel.panel-default', [
        m('ul.nav nav-pills nav-stacked', [
          navlink("/categories", "Категории товаров"),
          navlink("/products", "Товары"),
          navlink("/pages", "Страницы"),
          navlink("/users", "Пользователи"),
        ])
    ])
  ];

  return [
    header,
    m("#content-wrapper", [
        m('#sidebar', sidebar),
        m('#content', m.component(component))
    ]),
  ];
};

function mixinLayout(layout, component) {
  return function () {
    return layout(component);
  };
};

module.exports = function (component) {
  return { controller: function () { }, view: mixinLayout(layout, component) }
}

},{}],12:[function(require,module,exports){
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
  return m('#pagesizeselector', [
      m('span', "Показывать на странице: "),
      [10, 50, 100, 500].map(function(size) {
        return m('a[href=#]', {class: (size == arg()) ? 'active' : '', onclick: ctrl.setpagesize.bind(this, size)}, size)
      })
  ]);
}

module.exports = PageSizeSelector;

},{"../helpers/funcs":9}],13:[function(require,module,exports){
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
      ? m('nav', [
        m('ul.pagination', 
          pages(args.list().length, args.pagesize())
          .map(function(p, index){
            return m('li', {class: (index == args.currentpage()) ? 'active' : ''}, 
                (index == args.currentpage())
                ? m('span', index+1)
                : m('a[href=/]', {onclick: ctrl.setpage.bind(this, index)}, index+1)
                )
          })
         )
      ])
      : ""
      );
}

module.exports = Paginator;

},{"../helpers/funcs":9}],14:[function(require,module,exports){
'use strict';

var LoadingSpinner = {};

LoadingSpinner.controller = function() {}
LoadingSpinner.view = function(ctrl) {
  return m('#loading-spinner.animated.fadeIn', [
      m('p.text-center', m('i.fa.fa-spin.fa-cog.fa-3x')),
      m('p.text-center', 'Подождите, идет загрузка...')
  ]);
}

var UpdatingSpinner = {};

UpdatingSpinner.controller = function(args) {}
UpdatingSpinner.view = function(ctrl, args) {
  return m('#updating-spinner.animated.fadeIn', [
      m('p#spinner-text', m('i.fa.fa-spin.fa-cog.fa-3x')),
  ]);
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
      : m.component(UpdatingSpinner)
      )
}

module.exports = Spinner;

},{}],15:[function(require,module,exports){
'use strict';
/*global m */

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
  "/products/:id": layout(ProductComponent),
});

},{"./category/categoriescomponent":1,"./category/categorycomponent":3,"./dashboard":5,"./layout/layout":11,"./page/pagecomponent":17,"./page/pagescomponent":18,"./product/productcomponent":20,"./product/productscomponent":21,"./user/usercomponent":23,"./user/userscomponent":24}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
  return m("#pagecomponent", [
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn', [
        m('.form-group', [
          m('label', 'Заголовок'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})
        ]),
        m('.form-group', [
          m('label', 'Содержание'),
          m.component(Editor, {text: ctrl.vm.record().content})
        ]),
        m('.form-group', [
          m('label', 'Мета описание'),
          m('input.form-control', {value: ctrl.vm.record().meta_description(), onchange: m.withAttr("value", ctrl.vm.record().meta_description)})
        ]),
        m('.form-group', [
          m('label', 'Мета ключевики'),
          m('input.form-control', {value: ctrl.vm.record().meta_keywords(), onchange: m.withAttr("value", ctrl.vm.record().meta_keywords)})
        ]),
        m('.form-group', [
          m('label', 'Опубликовать'),
          m('input[type=checkbox]', {checked: ctrl.vm.record().published(), onclick: m.withAttr("checked", ctrl.vm.record().published)})
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
          m('button.btn.btn-danger', { onclick: ctrl.cancel }, [
            m('i.fa.fa-times'),
            m('span', 'Отмена')
          ])
        ])
      ])
      : m.component(Spinner, {standalone: true})
    ])
}

module.exports = PageComponent;

},{"../editor/editorcomponent":6,"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./page":16}],18:[function(require,module,exports){
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
        [
        m('td', data.name()),
        m('td.shrink', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-default[title=Просмотр]', {onclick: ctrl.show.bind(this, data)}, m('i.fa.fa-eye')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
        ])
        ]
        );
  } //showRowTemplate

  //complete view
  return m("#pagescomponent", [
      m("h1", ctrl.title),
      m('div', [
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()), [
          m('thead', 
            m('tr', [
              m('th.clickable[data-sort-by=name]', 'Заголовок'),
              m('th.shrink.clickable[data-sort-by=published]', 'Опубликовано'),
              m('th.shrink.actions', '#')
            ])
           ),
          m('tbody', 
            ctrl.vm.list()
            //if record list is ready, else show spinner
            ? [
            //slice filters records from current page only
            ctrl.vm.list()
            .slice(ctrl.currentpage()*ctrl.pagesize(), (ctrl.currentpage()+1)*ctrl.pagesize())
            .map(function(data){
              return showRowTemplate(data)
            }
            ),
            (!ctrl.vm.list().length) 
            ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.'))
            : "",
            ctrl.updating() ? m.component(Spinner) : ""
            ]
            : m.component(Spinner)
           ), //tbody
          ]), //table
          m('.actions', [
              m('button.btn.btn-primary', { onclick: ctrl.create }, [
                m('i.fa.fa-plus'),
                m('span', 'Добавить страницу')
              ]),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))
          ]),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : "",
          ])
      ]);
}

module.exports = PagesComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./page":16}],19:[function(require,module,exports){
'use strict';

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
}

},{}],20:[function(require,module,exports){
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
  return m("#productcomponent", [
      m("h1", ctrl.title),
      ctrl.vm.record()
      ? m('form.animated.fadeIn', [
        m('.form-group', [
          m('label', 'Название'),
          m('input.form-control', {value: ctrl.vm.record().name(), onchange: m.withAttr("value", ctrl.vm.record().name)})
        ]),
        m('.row', [
          m('.form-group col-sm-6', [
            m('label', 'Категория'),
            m.component(CategorySelect, {value: ctrl.vm.record().category_id, error: ctrl.error}),
          ]),
          m('.form-group col-sm-6', [
            m('label', 'Цена'),
            m('.input-group', [
              m('input.form-control[type=number][step=0.01]', {value: ctrl.vm.record().price(), onchange: m.withAttr("value", ctrl.vm.record().price)}),
              m('span.input-group-addon', 'р.')
            ])
          ]),
        ]),
        m('.form-group', [
          m('label', 'Содержание'),
          m.component(Editor, {text: ctrl.vm.record().content})
        ]),
        m('.form-group', [
          m('label', 'Мета описание'),
          m('input.form-control', {value: ctrl.vm.record().meta_description(), onchange: m.withAttr("value", ctrl.vm.record().meta_description)})
        ]),
        m('.form-group', [
          m('label', 'Мета ключевики'),
          m('input.form-control', {value: ctrl.vm.record().meta_keywords(), onchange: m.withAttr("value", ctrl.vm.record().meta_keywords)})
        ]),
        m('.form-group', [
          m('label', 'Опубликовать'),
          m('input[type=checkbox]', {checked: ctrl.vm.record().published(), onclick: m.withAttr("checked", ctrl.vm.record().published)})
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
          m('button.btn.btn-danger', { onclick: ctrl.cancel }, [
            m('i.fa.fa-times'),
            m('span', 'Отмена')
          ])
        ])
      ])
      : m.component(Spinner, {standalone: true})
    ]);
}

module.exports = ProductComponent;

},{"../category/categoryselect":4,"../editor/editorcomponent":6,"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./product":19}],21:[function(require,module,exports){
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
        }
        );
  }
}
ProductsComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        [
        m('td.shrink', (data.image()) ? m('img.image-preview.img-responsive', {src: data.image()}) : ""),
        m('td', data.name()),
        m('td.shrink', data.category_name()),
        m('td.shrink.text-center', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-default[title=Просмотр]', {onclick: ctrl.show.bind(this, data)}, m('i.fa.fa-eye')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
        ])
        ]
        );
  } //showRowTemplate

  //complete view
  return m("#productlist", [
      m("h1", ctrl.title),
      m('div', [
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()), [
          m('thead', 
            m('tr', [
              m('th.clickable[data-sort-by=image]', 'Фото'),
              m('th.clickable[data-sort-by=name]', 'Название'),
              m('th.clickable[data-sort-by=category_name]', 'Категория'),
              m('th.shrink.clickable[data-sort-by=published]', 'Опубликована'),
              m('th.shrink.actions', '#')
            ])
           ),
          m('tbody', 
            ctrl.vm.list()
            //if record list is ready, else show spinner
            ? [
            //slice filters records from current page only
            ctrl.vm.list()
            .slice(ctrl.currentpage()*ctrl.pagesize(), (ctrl.currentpage()+1)*ctrl.pagesize())
            .map(function(data){
              return showRowTemplate(data)
            }
            ),
            (!ctrl.vm.list().length) 
            ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.'))
            : "",
            ctrl.updating() ? m.component(Spinner) : ""
            ]
            : m.component(Spinner)
           ), //tbody
          ]), //table
          m('.actions', [
              m('button.btn.btn-primary', { onclick: ctrl.create }, [
                m('i.fa.fa-plus'),
                m('span', 'Добавить товар')
              ]),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))
          ]),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : "",
          ])
            ]);
}

module.exports = ProductsComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./product":19}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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
          m('input.form-control[type=password]', {value: ctrl.vm.record().password(), onchange: m.withAttr("value", ctrl.vm.record().password)})
        ]),
        m('.form-group', [
          m('label', 'Подтверждение пароля'),
          m('input.form-control[type=password]', {value: ctrl.vm.record().password_confirm(), onchange: m.withAttr("value", ctrl.vm.record().password_confirm)})
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
            m('button.btn.btn-danger', { onclick: ctrl.cancel }, [
              m('i.fa.fa-times'),
              m('span', 'Отмена')
            ])
        ])
          ])
          : m.component(Spinner, {standalone: true})
          ]);
}

module.exports = UserComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./user":22}],24:[function(require,module,exports){
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
        }
        );
  }
}
UsersComponent.view = function (ctrl) {

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.edit.bind(this, data)},
        [
        m('td', data.email()),
        m('td.shrink', data.name()),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
        ])
        ]
        );
  } //showRowTemplate

  //complete view
  return m("#userlist", [
      m("h1", ctrl.title),
      m('div', [
        m('table.table.table-striped.animated.fadeIn', funcs.sorts(ctrl.vm.list()), [
          m('thead', 
            m('tr', [
              m('th.clickable[data-sort-by=email]', 'Эл. почта'),
              m('th.shrink.clickable[data-sort-by=name]', 'Имя'),
              m('th.shrink.actions', '#')
            ])
           ),
          m('tbody', 
            ctrl.vm.list()
            //if record list is ready, else show spinner
            ? [
            //slice filters records from current page only
            ctrl.vm.list()
            .slice(ctrl.currentpage()*ctrl.pagesize(), (ctrl.currentpage()+1)*ctrl.pagesize())
            .map(function(data){
              return showRowTemplate(data)
            }
            ),
            (!ctrl.vm.list().length) 
            ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.'))
            : "",
            ctrl.updating() ? m.component(Spinner) : ""
            ]
            : m.component(Spinner)
           ), //tbody
          ]), //table
          m('.actions', [
              m('button.btn.btn-primary', { onclick: ctrl.create }, [
                m('i.fa.fa-plus'),
                m('span', 'Добавить пользователя')
              ]),
              m('.pull-right', m.component(PageSizeSelector, ctrl.pagesize))
          ]),
          ctrl.vm.list() ? m.component(Paginator, {list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage}) : "",
          ])
            ]);
}

module.exports = UsersComponent;

},{"../helpers/funcs":9,"../helpers/model":10,"../layout/pagesizeselector":12,"../layout/paginator":13,"../layout/spinner":14,"./user":22}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvY2F0ZWdvcnkvY2F0ZWdvcmllc2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeS5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeWNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeXNlbGVjdC5qcyIsImFzc2V0cy9qcy9kYXNoYm9hcmQuanMiLCJhc3NldHMvanMvZWRpdG9yL2VkaXRvcmNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9lZGl0b3IvaW1nbW9kYWxjb21wb25lbnQuanMiLCJhc3NldHMvanMvZWRpdG9yL2xpbmttb2RhbGNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9oZWxwZXJzL2Z1bmNzLmpzIiwiYXNzZXRzL2pzL2hlbHBlcnMvbW9kZWwuanMiLCJhc3NldHMvanMvbGF5b3V0L2xheW91dC5qcyIsImFzc2V0cy9qcy9sYXlvdXQvcGFnZXNpemVzZWxlY3Rvci5qcyIsImFzc2V0cy9qcy9sYXlvdXQvcGFnaW5hdG9yLmpzIiwiYXNzZXRzL2pzL2xheW91dC9zcGlubmVyLmpzIiwiYXNzZXRzL2pzL21haW4uanMiLCJhc3NldHMvanMvcGFnZS9wYWdlLmpzIiwiYXNzZXRzL2pzL3BhZ2UvcGFnZWNvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9wYWdlL3BhZ2VzY29tcG9uZW50LmpzIiwiYXNzZXRzL2pzL3Byb2R1Y3QvcHJvZHVjdC5qcyIsImFzc2V0cy9qcy9wcm9kdWN0L3Byb2R1Y3Rjb21wb25lbnQuanMiLCJhc3NldHMvanMvcHJvZHVjdC9wcm9kdWN0c2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy91c2VyL3VzZXIuanMiLCJhc3NldHMvanMvdXNlci91c2VyY29tcG9uZW50LmpzIiwiYXNzZXRzL2pzL3VzZXIvdXNlcnNjb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBDYXRlZ29yeSA9IHJlcXVpcmUoJy4vY2F0ZWdvcnknKTtcblxuXG52YXIgQ2F0ZWdvcmllc0NvbXBvbmVudCA9IHt9O1xuQ2F0ZWdvcmllc0NvbXBvbmVudC52bSA9IHt9O1xuQ2F0ZWdvcmllc0NvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL2NhdGVnb3JpZXNcIiwgdHlwZTogQ2F0ZWdvcnl9KTtcbiAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KCk7XG4gIHJldHVybiB0aGlzO1xufVxuQ2F0ZWdvcmllc0NvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgY3RybC52bSA9IENhdGVnb3JpZXNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0JrQsNGC0LXQs9C+0YDQuNC4INGC0L7QstCw0YDQvtCyXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZnVuY3MuZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuc2hvdyA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgd2luZG93LmxvY2F0aW9uID0gXCIvY2F0ZWdvcnkvXCIrcm93LmlkKCkrXCItXCIrcm93LnNsdWcoKTtcbiAgfVxuICBjdHJsLmVkaXQgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL2NhdGVnb3JpZXMvXCIrcm93LmlkKCkpO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9jYXRlZ29yaWVzL25ld1wiKTtcbiAgfVxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKTtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gZnVuY3MucGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG59XG5DYXRlZ29yaWVzQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG0oJ3RyLmNsaWNrYWJsZScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXG4gICAgICAgIFtcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluay50ZXh0LWNlbnRlcicsIGRhdGEucHVibGlzaGVkKCkgPyBtKCdpLmZhLmZhLWNoZWNrJykgOiBtKCdpLmZhLmZhLXRpbWVzJykpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCf0YDQvtGB0LzQvtGC0YBdJywge29uY2xpY2s6IGN0cmwuc2hvdy5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1leWUnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRhbmdlclt0aXRsZT3Qo9C00LDQu9C40YLRjF0nLCB7b25jbGljazogY3RybC5kZWxldGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcmVtb3ZlJykpXG4gICAgICAgIF0pXG4gICAgICAgIF1cbiAgICAgICAgKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNjYXRlZ29yeWxpc3RcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JywgW1xuICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIGZ1bmNzLnNvcnRzKGN0cmwudm0ubGlzdCgpKSwgW1xuICAgICAgICAgIG0oJ3RoZWFkJywgXG4gICAgICAgICAgICBtKCd0cicsIFtcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQndCw0LfQstCw0L3QuNC1JyksXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PXB1Ymxpc2hlZF0nLCAn0J7Qv9GD0LHQu9C40LrQvtCy0LDQvdCwJyksXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5hY3Rpb25zJywgJyMnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgKSxcbiAgICAgICAgICBtKCd0Ym9keScsIFxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC8vaWYgcmVjb3JkIGxpc3QgaXMgcmVhZHksIGVsc2Ugc2hvdyBzcGlubmVyXG4gICAgICAgICAgICA/IFtcbiAgICAgICAgICAgIC8vc2xpY2UgZmlsdGVycyByZWNvcmRzIGZyb20gY3VycmVudCBwYWdlIG9ubHlcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAuc2xpY2UoY3RybC5jdXJyZW50cGFnZSgpKmN0cmwucGFnZXNpemUoKSwgKGN0cmwuY3VycmVudHBhZ2UoKSsxKSpjdHJsLnBhZ2VzaXplKCkpXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICByZXR1cm4gc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgKCFjdHJsLnZtLmxpc3QoKS5sZW5ndGgpIFxuICAgICAgICAgICAgPyBtKCd0cicsIG0oJ3RkLnRleHQtY2VudGVyLnRleHQtbXV0ZWRbY29sc3Bhbj00XScsICfQodC/0LjRgdC+0Log0L/Rg9GB0YIsINC90LDQttC80LjRgtC1INCU0L7QsdCw0LLQuNGC0YwsINGH0YLQvtCx0Ysg0YHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQt9Cw0L/QuNGB0YwuJykpXG4gICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKCkgPyBtLmNvbXBvbmVudChTcGlubmVyKSA6IFwiXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcbiAgICAgICAgICAgKSwgLy90Ym9keVxuICAgICAgICAgIF0pLCAvL3RhYmxlXG4gICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnknLCB7IG9uY2xpY2s6IGN0cmwuY3JlYXRlIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcbiAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQsNGC0LXQs9C+0YDQuNGOJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgY3RybC52bS5saXN0KCkgPyBtLmNvbXBvbmVudChQYWdpbmF0b3IsIHtsaXN0OiBjdHJsLnZtLmxpc3QsIHBhZ2VzaXplOiBjdHJsLnBhZ2VzaXplLCBjdXJyZW50cGFnZTogY3RybC5jdXJyZW50cGFnZSwgb25zZXRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlfSkgOiBcIlwiLFxuICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXRlZ29yaWVzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5zbHVnID0gbS5wcm9wKGRhdGEuc2x1ZyB8fCAnJyk7XG4gIHRoaXMuY29udGVudCA9IG0ucHJvcChkYXRhLmNvbnRlbnQgfHwgJycpO1xuICB0aGlzLnB1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLnB1Ymxpc2hlZCB8fCB0cnVlKTtcbiAgdGhpcy5tZXRhX2Rlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEubWV0YV9kZXNjcmlwdGlvbiB8fCAnJyk7XG4gIHRoaXMubWV0YV9rZXl3b3JkcyA9IG0ucHJvcChkYXRhLm1ldGFfa2V5d29yZHMgfHwgJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBDYXRlZ29yeSA9IHJlcXVpcmUoXCIuL2NhdGVnb3J5XCIpO1xudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvci9lZGl0b3Jjb21wb25lbnQnKTtcblxudmFyIENhdGVnb3J5Q29tcG9uZW50ID0ge307XG5DYXRlZ29yeUNvbXBvbmVudC52bSA9IHt9O1xuQ2F0ZWdvcnlDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvY2F0ZWdvcmllc1wiLCB0eXBlOiBDYXRlZ29yeX0pO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICB2bS5yZWNvcmQgPSBtLnByb3AobmV3IENhdGVnb3J5KCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbkNhdGVnb3J5Q29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gQ2F0ZWdvcnlDb21wb25lbnQudm0uaW5pdCgpO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKTtcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCh0L7Qt9C00LDQvdC40LUg0LrQsNGC0LXQs9C+0YDQuNC4XCI7XG4gIH0gZWxzZSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gICAgY3RybC52bS5yZWNvcmQudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgNGC0L7Rh9C60LAg0LrQsNGC0LXQs9C+0YDQuNC4XCI7XG4gIH1cbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG4gIGN0cmwubWVzc2FnZSA9IG0ucHJvcCgnJyk7IC8vbm90aWZpY2F0aW9uc1xuXG4gIGN0cmwuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgbS5yb3V0ZShcIi9jYXRlZ29yaWVzXCIpO1xuICB9XG4gIGN0cmwudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC5tZXNzYWdlKCcnKTtcbiAgICBjdHJsLmVycm9yKCcnKTtcbiAgICBjdHJsLnZtLm1vZGVsLnVwZGF0ZShjdHJsLnZtLnJlY29yZCgpKVxuICAgICAgLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge2N0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO30sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTt9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KTtcbiAgfVxuICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC52bS5yZWNvcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHttLnJvdXRlKFwiL2NhdGVnb3JpZXNcIik7fSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfSk7XG4gIH1cbn1cbkNhdGVnb3J5Q29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNjYXRlZ29yeWNvbXBvbmVudFwiLCBbXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBjdHJsLnZtLnJlY29yZCgpXG4gICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQndCw0LfQstCw0L3QuNC1JyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm5hbWUoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm5hbWUpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ce0L/QuNGB0LDQvdC40LUnKSxcbiAgICAgICAgICBtLmNvbXBvbmVudChFZGl0b3IsIHt0ZXh0OiBjdHJsLnZtLnJlY29yZCgpLmNvbnRlbnR9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JzQtdGC0LAg0L7Qv9C40YHQsNC90LjQtScpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5tZXRhX2Rlc2NyaXB0aW9uKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5tZXRhX2Rlc2NyaXB0aW9uKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQnNC10YLQsCDQutC70Y7Rh9C10LLQuNC60LgnKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkubWV0YV9rZXl3b3JkcygpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkubWV0YV9rZXl3b3Jkcyl9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMJyksXG4gICAgICAgICAgbSgnaW5wdXRbdHlwZT1jaGVja2JveF0nLCB7Y2hlY2tlZDogY3RybC52bS5yZWNvcmQoKS5wdWJsaXNoZWQoKSwgb25jbGljazogbS53aXRoQXR0cihcImNoZWNrZWRcIiwgY3RybC52bS5yZWNvcmQoKS5wdWJsaXNoZWQpfSlcbiAgICAgICAgXSksXG4gICAgICAgIChjdHJsLm1lc3NhZ2UoKSkgPyBtKCcuYWN0aW9uLW1lc3NhZ2UuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLm1lc3NhZ2UoKSkgOiBcIlwiLFxuICAgICAgICAoY3RybC5lcnJvcigpKSA/IG0oJy5hY3Rpb24tYWxlcnQuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLmVycm9yKCkpIDogXCJcIixcbiAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKVxuICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXG4gICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7Qt9C00LDRgtGMJylcbiAgICAgICAgICBdKVxuICAgICAgICAgIDogW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC51cGRhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xuICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0YXRgNCw0L3QuNGC0YwnKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tZGFuZ2VyJywgeyBvbmNsaWNrOiBjdHJsLmNhbmNlbCB9LCBbXG4gICAgICAgICAgICBtKCdpLmZhLmZhLXRpbWVzJyksXG4gICAgICAgICAgICBtKCdzcGFuJywgJ9Ce0YLQvNC10L3QsCcpXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcbiAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXRlZ29yeUNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKFwiLi4vaGVscGVycy9tb2RlbFwiKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZShcIi4uL2xheW91dC9zcGlubmVyXCIpO1xudmFyIFBhZ2VTaXplU2VsZWN0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3JcIik7XG52YXIgUGFnaW5hdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdpbmF0b3JcIik7XG52YXIgQ2F0ZWdvcnkgPSByZXF1aXJlKFwiLi9jYXRlZ29yeVwiKTtcblxudmFyIENhdGVnb3J5U2VsZWN0ID0ge307XG5DYXRlZ29yeVNlbGVjdC52bSA9IHt9O1xuQ2F0ZWdvcnlTZWxlY3Qudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLmxpc3QgPSBmdW5jcy5tcmVxdWVzdCh7IG1ldGhvZDogXCJHRVRcIiwgdXJsOiBcIi9hcGkvY2F0ZWdvcmllc1wiLCB0eXBlOiBDYXRlZ29yeSB9KTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vYXJnczoge3ZhbHVlOiBtLnByb3AsIGVycm9yOiBtLnByb3Agb3B0aW9uYWx9XG5DYXRlZ29yeVNlbGVjdC5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBjdHJsLnZhbHVlID0gYXJncy52YWx1ZTtcbiAgY3RybC52bSA9IENhdGVnb3J5U2VsZWN0LnZtLmluaXQoKTtcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oZGF0YSl7IGlmIChkYXRhLmxlbmd0aCkgY3RybC52YWx1ZShkYXRhWzBdLmlkKCkpIH0pOyAvL2luaXRpYWwgdmFsdWVcbiAgY3RybC5lcnJvciA9IGFyZ3MuZXJyb3IgfHwgbS5wcm9wKCcnKTtcbn1cbkNhdGVnb3J5U2VsZWN0LnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gIHJldHVybiBtKFwic2VsZWN0LmZvcm0tY29udHJvbFwiLCB7XG4gICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZhbHVlKVxuICB9LFxuICBjdHJsLnZtLmxpc3QoKSBcbiAgPyBjdHJsLnZtLmxpc3QoKS5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgcmV0dXJuIG0oJ29wdGlvbicsIHt2YWx1ZTogZGF0YS5pZCgpfSwgZGF0YS5uYW1lKCkpXG4gIH0pXG4gIDogXCJcIlxuICApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhdGVnb3J5U2VsZWN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgRGFzaGJvYXJkQ29tcG9uZW50ID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0J/QsNC90LXQu9GMINCw0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGA0LBcIjtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gbShcImgxXCIsIGN0cmwudGl0bGUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGFzaGJvYXJkQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcblxudmFyIExpbmtNb2RhbCA9IHJlcXVpcmUoJy4vbGlua21vZGFsY29tcG9uZW50Jyk7XG52YXIgSW1nTW9kYWwgPSByZXF1aXJlKCcuL2ltZ21vZGFsY29tcG9uZW50Jyk7XG5cbnZhciBFZGl0b3JDb21wb25lbnQgPSB7fVxuXG4vL2FyZ3M6IHt0ZXh0OiBtLnByb3AoLi4pfVxuRWRpdG9yQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnRleHQgPSBhcmdzLnRleHQ7XG4gIGlmIChjdHJsLnRleHQoKSA9PSAnJylcbiAgICBjdHJsLnRleHQoJzxwPjwvcD4nKTtcbiAgY3RybC5jb2RlID0gbS5wcm9wKGZhbHNlKTsgLy92aWV3IGh0bWwgc291cmNlXG4gIFxuICBjdHJsLnNob3dfbGlua19tb2RhbCA9IG0ucHJvcChmYWxzZSk7XG4gIGN0cmwubGlua19ocmVmID0gbS5wcm9wKCcnKTtcbiAgY3RybC5zYXZlZF9zZWxlY3Rpb24gPSBudWxsO1xuXG4gIGN0cmwuc2hvd19pbWdfbW9kYWwgPSBtLnByb3AoZmFsc2UpO1xuICBjdHJsLmltZ19zcmMgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwub25fbGlua19tb2RhbF9zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgY3RybC5zYXZlZF9zZWxlY3Rpb24gPSBmdW5jcy5zYXZlU2VsZWN0aW9uKCk7XG4gICAgY3RybC5saW5rX2hyZWYoJycpO1xuICAgIGN0cmwuc2hvd19saW5rX21vZGFsKHRydWUpO1xuICB9XG4gIGN0cmwub25fbGlua19tb2RhbF9oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgZnVuY3MucmVzdG9yZVNlbGVjdGlvbihjdHJsLnNhdmVkX3NlbGVjdGlvbik7XG4gICAgaWYgKGN0cmwubGlua19ocmVmKCkpXG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY3JlYXRlTGluaycsIGZhbHNlLCBjdHJsLmxpbmtfaHJlZigpKTtcbiAgICBjdHJsLnNob3dfbGlua19tb2RhbChmYWxzZSk7XG4gIH1cblxuICBjdHJsLm9uX2ltZ19tb2RhbF9zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgY3RybC5zYXZlZF9zZWxlY3Rpb24gPSBmdW5jcy5zYXZlU2VsZWN0aW9uKCk7XG4gICAgY3RybC5pbWdfc3JjKCcnKTtcbiAgICBjdHJsLnNob3dfaW1nX21vZGFsKHRydWUpO1xuICB9XG4gIGN0cmwub25faW1nX21vZGFsX2hpZGUgPSBmdW5jdGlvbigpIHtcbiAgICBmdW5jcy5yZXN0b3JlU2VsZWN0aW9uKGN0cmwuc2F2ZWRfc2VsZWN0aW9uKTtcbiAgICBpZiAoY3RybC5pbWdfc3JjKCkpXG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnaW5zZXJ0SW1hZ2UnLCBmYWxzZSwgY3RybC5pbWdfc3JjKCkpO1xuICAgIGN0cmwuc2hvd19pbWdfbW9kYWwoZmFsc2UpO1xuICB9XG59XG5cbkVkaXRvckNvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24oY3RybCkge1xuICB2YXIgYnV0dG9uID0gZnVuY3Rpb24obmFtZSwgYWN0aW9uLCB0aXRsZSkge1xuICAgIHJldHVybiBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdCcsIHtcbiAgICAgIGNsYXNzOiAoY3RybC5jb2RlKCkgJiYgYWN0aW9uID09IFwiY29kZVwiKSA/IFwiYWN0aXZlXCIgOiBcIlwiLFxuICAgICAgZGlzYWJsZWQ6IChjdHJsLmNvZGUoKSAmJiBhY3Rpb24gIT0gJ2NvZGUnKSA/IHRydWUgOiBmYWxzZSxcbiAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoYWN0aW9uID09ICdjb2RlJykge1xuICAgICAgICAgIGN0cmwuY29kZSghY3RybC5jb2RlKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PSAnY3JlYXRlTGluaycpIHtcbiAgICAgICAgICBjdHJsLm9uX2xpbmtfbW9kYWxfc2hvdygpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PSAnaW5zZXJ0SW1hZ2UnKSB7XG4gICAgICAgICAgY3RybC5zaG93X2ltZ19tb2RhbCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChhY3Rpb24sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIG5hbWUpXG4gIH1cblxuICB2YXIgYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcuYnRuLWdyb3VwJywgW1xuICAgICAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWJvbGQnKSwgJ2JvbGQnLCAn0J/QvtC70YPQttC40YDQvdGL0LknKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1pdGFsaWMnKSwgJ2l0YWxpYycsICfQmtGD0YDRgdC40LInKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS11bmRlcmxpbmUnKSwgJ3VuZGVybGluZScsICfQn9C+0LTRh9C10YDQutC90YPRgtGL0LknKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1zdHJpa2V0aHJvdWdoJyksICdzdHJpa2VUaHJvdWdoJywgJ9CX0LDRh9C10YDQutC90YPRgtGL0LknKSxcbiAgICAgIF0pLFxuICAgICAgbSgnLmJ0bi1ncm91cCcsIFtcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1zdWJzY3JpcHQnKSwgJ3N1YnNjcmlwdCcsICfQktC10YDRhdC90LjQuSDQuNC90LTQtdC60YEnKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1zdXBlcnNjcmlwdCcpLCAnc3VwZXJzY3JpcHQnLCAn0J3QuNC20L3QuNC5INC40L3QtNC10LrRgScpLFxuICAgICAgXSksXG4gICAgICBtKCcuYnRuLWdyb3VwJywgW1xuICAgICAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWxpc3Qtb2wnKSwgJ2luc2VydE9yZGVyZWRMaXN0JywgJ9Cd0YPQvNC10YDQvtCy0LDQvdC90YvQuSDRgdC/0LjRgdC+0LonKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1saXN0LXVsJyksICdpbnNlcnRVbm9yZGVyZWRMaXN0JywgJ9Cc0LDRgNC60LjRgNC+0LLQsNC90L3Ri9C5INGB0L/QuNGB0L7QuicpLFxuICAgICAgXSksXG4gICAgICBtKCcuYnRuLWdyb3VwJywgW1xuICAgICAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWFsaWduLWxlZnQnKSwgJ2p1c3RpZnlMZWZ0JywgJ9Cf0L4g0LvQtdCy0L7QvNGDINC60YDQsNGOJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtYWxpZ24tcmlnaHQnKSwgJ2p1c3RpZnlSaWdodCcsICfQn9C+INC/0YDQsNCy0L7QvNGDINC60YDQsNGOJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtYWxpZ24tY2VudGVyJyksICdqdXN0aWZ5Q2VudGVyJywgJ9Cf0L4g0YbQtdC90YLRgNGDJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtYWxpZ24tanVzdGlmeScpLCAnanVzdGlmeUZ1bGwnLCAn0J/QviDRiNC40YDQuNC90LUnKSxcbiAgICAgIF0pLFxuICAgICAgbSgnLmJ0bi1ncm91cCcsIFtcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS11bmRvJyksICd1bmRvJywgJ9Ce0YLQvNC10L3QuNGC0YwnKSxcbiAgICAgICAgICBidXR0b24obSgnaS5mYS5mYS1yZXBlYXQnKSwgJ3JlZG8nLCAn0J/QvtCy0YLQvtGA0LjRgtGMJyksXG4gICAgICBdKSxcbiAgICAgIG0oJy5idG4tZ3JvdXAnLCBbXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtbGluaycpLCAnY3JlYXRlTGluaycsICfQk9C40L/QtdGA0YHRgdGL0LvQutCwJyksXG4gICAgICAgICAgYnV0dG9uKG0oJ2kuZmEuZmEtdW5saW5rJyksICd1bmxpbmsnLCAn0KPQtNCw0LvQuNGC0Ywg0LPQuNC/0LXRgNGB0YHRi9C70LrRgycpLFxuICAgICAgXSksXG4gICAgICBidXR0b24obSgnaS5mYS5mYS1pbWFnZScpLCAnaW5zZXJ0SW1hZ2UnLCAn0JLRgdGC0LDQstC40YLRjCDQuNC30L7QsdGA0LDQttC10L3QuNC1JyksXG4gICAgICBidXR0b24obSgnaS5mYS5mYS1lcmFzZXInKSwgJ3JlbW92ZUZvcm1hdCcsICfQntGH0LjRgdGC0LjRgtGMINGE0L7RgNC80LDRgtC40YDQvtCy0LDQvdC40LUnKSxcbiAgICAgIGJ1dHRvbihtKCdpLmZhLmZhLWNvZGUnKSwgJ2NvZGUnLCAn0JjRgdGF0L7QtNC90YvQuSDQutC+0LQnKSxcbiAgICBdO1xuICB9XG4gIFxuICByZXR1cm4gbSgnLmVkaXRvcicsIFtcbiAgICAgIG0oJy5hY3Rpb25zJywgYWN0aW9ucygpKSxcbiAgICAgIGN0cmwuc2hvd19saW5rX21vZGFsKCkgPyBtLmNvbXBvbmVudChMaW5rTW9kYWwsIHtocmVmOiBjdHJsLmxpbmtfaHJlZiwgb25oaWRlOiBjdHJsLm9uX2xpbmtfbW9kYWxfaGlkZX0pIDogXCJcIixcbiAgICAgIGN0cmwuc2hvd19pbWdfbW9kYWwoKSA/IG0uY29tcG9uZW50KEltZ01vZGFsLCB7c3JjOiBjdHJsLmltZ19zcmMsIG9uaGlkZTogY3RybC5vbl9pbWdfbW9kYWxfaGlkZX0pIDogXCJcIixcbiAgICAgIGN0cmwuY29kZSgpID9cbiAgICAgIG0oJ3RleHRhcmVhLmVkaXRvci1hcmVhLmZvcm0tY29udHJvbCcsIHtcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC50ZXh0KSxcbiAgICAgICAgdmFsdWU6IGN0cmwudGV4dCgpLFxuICAgICAgfSlcbiAgICAgIDpcbiAgICAgIG0oJy5lZGl0b3ItYXJlYS5mb3JtLWNvbnRyb2wnLCB7XG4gICAgICAgIGFzOiBjdHJsLmNvZGUoKSA/ICcnIDogJ3RleHQnLFxuICAgICAgICBjb250ZW50ZWRpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGlzSW5pdGVkLCBjb250ZXh0KSB7XG4gICAgICAgICBpZiAoaXNJbml0ZWQpIHJldHVybjtcbiAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIGN0cmwudGV4dChlbC5pbm5lckhUTUwpO1xuICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9LCBtLnRydXN0KGN0cmwudGV4dCgpKSksXG4gICAgXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG5cbnZhciBJbWdNb2RhbENvbXBvbmVudCA9IHt9XG5cbi8vYXJnczoge3NyYzogbS5wcm9wKHN0ciksIG9uaGlkZTogZnVuY3Rpb259XG5JbWdNb2RhbENvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY3RybCA9IHRoaXM7XG4gIFxuICBjdHJsLnNyYyA9IGFyZ3Muc3JjOyAvL3JldHVybiB2YWx1ZVxuICBjdHJsLnNyYygnJyk7XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwub25maWxlc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1hZ2VfaW5wdXQnKS5maWxlc1swXTtcbiAgICB2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGRhdGEuYXBwZW5kKCd1cGxvYWQnLCBmaWxlKTtcbiAgICBmdW5jcy5tcmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICB1cmw6ICcvYXBpL3VwbG9hZCcsIFxuICAgICAgZGF0YTogZGF0YSwgXG4gICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gZGF0YX1cbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICBjdHJsLnNyYyhzdWNjZXNzLnVyaSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgY3RybC5lcnJvcihlcnJvcik7XG4gICAgICB9KTtcbiAgfVxuICBjdHJsLm9uaGlkZSA9IGZ1bmN0aW9uKG9rY2FuY2VsKSB7XG4gICAgaWYgKG9rY2FuY2VsID09ICdvaycpIHtcbiAgICB9IGVsc2Uge1xuICAgICAgY3RybC5zcmMoJycpO1xuICAgIH1cbiAgICBhcmdzLm9uaGlkZSgpOyBcbiAgfVxufVxuXG5JbWdNb2RhbENvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gbSgnLm1vZGFsLmZhZGUuaW4uYW5pbWF0ZWQuZmFkZUluLnNob3duW3JvbGU9ZGlhbG9nXScsIFtcbiAgICAgIG0oJy5tb2RhbC1kaWFsb2dbcm9sZT1kb2N1bWVudF0nLCBbXG4gICAgICAgIG0oJy5tb2RhbC1jb250ZW50JywgW1xuICAgICAgICAgIG0oJy5tb2RhbC1oZWFkZXInLCBbXG4gICAgICAgICAgICBtKCdoNC5tb2RhbC10aXRsZScsICfQl9Cw0LPRgNGD0LfQutCwINC40LfQvtCx0YDQsNC20LXQvdC40Y8nKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcubW9kYWwtYm9keScsIFtcbiAgICAgICAgICAgIG0oJy5maWxlLXVwbG9hZC13cmFwcGVyLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICAgIG0oJ2lucHV0I2ltYWdlX2lucHV0W3R5cGU9ZmlsZV0nLCB7b25jaGFuZ2U6IGN0cmwub25maWxlc2VsZWN0fSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGN0cmwuZXJyb3IoKSA/XG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgICAgbSgnbGFiZWwudGV4dC1kYW5nZXInLCBjdHJsLmVycm9yKCkpXG4gICAgICAgICAgICBdKSA6IFwiXCIsXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgICAgbSgnbGFiZWwnLCAn0JDQtNGA0LXRgSDQuNC30L7QsdGA0LDQttC10L3QuNGPJyksXG4gICAgICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC5zcmMoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5zcmMpLCBwbGFjZWhvbGRlcjogJ9CS0YvQsdC10YDQuNGC0LUg0YTQsNC50Lsg0LjQu9C4INGD0LrQsNC20LjRgtC1INCw0LTRgNC10YEg0LjQt9C+0LHRgNCw0LbQtdC90LjRjyDQstGA0YPRh9C90YPRjid9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLm1vZGFsLWZvb3RlcicsIFtcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1idXR0b25dJywge29uY2xpY2s6IGN0cmwub25oaWRlLmJpbmQodGhpcywgJ29rJyl9LCAn0JLRgdGC0LDQstC40YLRjCcpLFxuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tZGVmYXVsdFt0eXBlPWJ1dHRvbl0nLCB7b25jbGljazogY3RybC5vbmhpZGUuYmluZCh0aGlzLCAnY2FuY2VsJyl9LCAn0J7RgtC80LXQvdCwJyksXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pLFxuICAgICAgXSksXG4gIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltZ01vZGFsQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTGlua01vZGFsQ29tcG9uZW50ID0ge31cblxuLy9hcmdzOiB7aHJlZjogbS5wcm9wKHN0ciksIG9uaGlkZTogZnVuY3Rpb259XG5MaW5rTW9kYWxDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBcbiAgY3RybC5ocmVmID0gYXJncy5ocmVmOyAvL3JldHVybiB2YWx1ZVxuICBjdHJsLm9uaGlkZSA9IGZ1bmN0aW9uKG9rY2FuY2VsKSB7XG4gICAgaWYgKG9rY2FuY2VsID09ICdjYW5jZWwnKVxuICAgICAgY3RybC5ocmVmKCcnKTtcbiAgICBhcmdzLm9uaGlkZSgpOyBcbiAgfVxufVxuXG5MaW5rTW9kYWxDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgcmV0dXJuIG0oJy5tb2RhbC5mYWRlLmluLmFuaW1hdGVkLmZhZGVJbi5zaG93bltyb2xlPWRpYWxvZ10nLCBbXG4gICAgICBtKCcubW9kYWwtZGlhbG9nW3JvbGU9ZG9jdW1lbnRdJywgW1xuICAgICAgICBtKCcubW9kYWwtY29udGVudCcsIFtcbiAgICAgICAgICBtKCcubW9kYWwtaGVhZGVyJywgW1xuICAgICAgICAgICAgbSgnaDQubW9kYWwtdGl0bGUnLCAn0JLQstC10LTQuNGC0LUg0LDQtNGA0LXRgSDRgdGB0YvQu9C60LgnKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcubW9kYWwtYm9keScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC5ocmVmKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwuaHJlZiksIHBsYWNlaG9sZGVyOiAnaHR0cDovLyd9KSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcubW9kYWwtZm9vdGVyJywgW1xuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPWJ1dHRvbl0nLCB7b25jbGljazogY3RybC5vbmhpZGUuYmluZCh0aGlzLCAnb2snKX0sICfQktGB0YLQsNCy0LjRgtGMJyksXG4gICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1kZWZhdWx0W3R5cGU9YnV0dG9uXScsIHtvbmNsaWNrOiBjdHJsLm9uaGlkZS5iaW5kKHRoaXMsICdjYW5jZWwnKX0sICfQntGC0LzQtdC90LAnKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgICBdKSxcbiAgXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGlua01vZGFsQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnBhcnNlRXJyb3IgPSBmdW5jdGlvbihlcnJzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gam9pbkVycm9ycyhKU09OLnBhcnNlKGVycnN0cikpO1xuICB9XG4gIGNhdGNoKGVycikge1xuICAgIHJldHVybiBlcnJzdHI7XG4gIH1cbn1cblxudmFyIGpvaW5FcnJvcnMgPSBmdW5jdGlvbihlcnJvcnMpIHtcbiAgaWYgKHR5cGVvZihlcnJvcnMpID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IGVycnN0ciA9IFwiXCI7XG4gICAgZm9yIChsZXQga2V5IGluIGVycm9ycykge1xuICAgICAgaWYgKHR5cGVvZihlcnJvcnNba2V5XSkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgZm9yIChsZXQgZWtleSBpbiBlcnJvcnNba2V5XSkge1xuICAgICAgICAgIGVycnN0ciArPSBlcnJvcnNba2V5XVtla2V5XSArIFwiLiBcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXJyc3RyO1xuICB9IGVsc2UgXG4gICAgcmV0dXJuIGVycm9ycztcbn1cblxuXG5leHBvcnRzLnBhZ2VzID0gZnVuY3Rpb24oYXJsZW4sIHBhZ2VzaXplKSB7XG4gIHJldHVybiBBcnJheShNYXRoLmZsb29yKGFybGVuL3BhZ2VzaXplKSArICgoYXJsZW4lcGFnZXNpemUgPiAwKSA/IDEgOiAwKSkuZmlsbCgwKTsgLy9yZXR1cm4gZW1wdHkgYXJyYXkgb2YgcGFnZXNcbn1cblxuZXhwb3J0cy5zb3J0cyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgcmV0dXJuIHtcbiAgICBvbmNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgcHJvcCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1ieVwiKTtcbiAgICAgIGlmIChwcm9wKSB7XG4gICAgICAgIHZhciBmaXJzdCA9IGxpc3RbMF07XG4gICAgICAgIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGFbcHJvcF0oKSA+IGJbcHJvcF0oKSA/IDEgOiBhW3Byb3BdKCkgPCBiW3Byb3BdKCkgPyAtMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZmlyc3QgPT09IGxpc3RbMF0pIGxpc3QucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLm1yZXF1ZXN0ID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgbm9uSnNvbkVycm9ycyA9IGZ1bmN0aW9uKHhocikge1xuICAgIHJldHVybiAoeGhyLnN0YXR1cyA+IDIwNCAmJiB4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aCkgXG4gICAgICA/IEpTT04uc3RyaW5naWZ5KHhoci5yZXNwb25zZVRleHQpIFxuICAgICAgOiAoeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGgpXG4gICAgICA/IHhoci5yZXNwb25zZVRleHRcbiAgICAgIDogbnVsbDtcbiAgfVxuICBhcmdzLmV4dHJhY3QgPSBub25Kc29uRXJyb3JzO1xuICByZXR1cm4gbS5yZXF1ZXN0KGFyZ3MpO1xufVxuXG5leHBvcnRzLnNldENvb2tpZSA9IGZ1bmN0aW9uKGNuYW1lLCBjdmFsdWUsIGV4ZGF5cykge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMqMjQqNjAqNjAqMTAwMCkpO1xuICB2YXIgZXhwaXJlcyA9IFwiZXhwaXJlcz1cIisgZC50b1VUQ1N0cmluZygpO1xuICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG59XG5cbmV4cG9ydHMuZ2V0Q29va2llID0gZnVuY3Rpb24oY25hbWUpIHtcbiAgdmFyIG5hbWUgPSBjbmFtZSArIFwiPVwiO1xuICB2YXIgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcbiAgZm9yKHZhciBpID0gMDsgaSA8Y2EubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYyA9IGNhW2ldO1xuICAgIHdoaWxlIChjLmNoYXJBdCgwKT09JyAnKSB7XG4gICAgICBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT0gMCkge1xuICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLGMubGVuZ3RoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFwiXCI7XG59XG5cbmV4cG9ydHMuc2F2ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgIHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgaWYgKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICB2YXIgcmFuZ2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2VsLnJhbmdlQ291bnQ7IGkgPCBsZW47ICsraSkge1xuICAgICAgICByYW5nZXMucHVzaChzZWwuZ2V0UmFuZ2VBdChpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmFuZ2VzO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkb2N1bWVudC5zZWxlY3Rpb24gJiYgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnRzLnJlc3RvcmVTZWxlY3Rpb24gPSBmdW5jdGlvbihzYXZlZFNlbCkge1xuICBpZiAoc2F2ZWRTZWwpIHtcbiAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzYXZlZFNlbC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICBzZWwuYWRkUmFuZ2Uoc2F2ZWRTZWxbaV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uICYmIHNhdmVkU2VsLnNlbGVjdCkge1xuICAgICAgc2F2ZWRTZWwuc2VsZWN0KCk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtcmVxdWVzdCA9IHJlcXVpcmUoXCIuL2Z1bmNzXCIpLm1yZXF1ZXN0O1xuXG4vL2FyZ3M6IHt1cmw6IFwiL2FwaS9leGFtcGxlXCIsIHR5cGU6IE9iamVjdFR5cGV9XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciBtb2RlbCA9IHRoaXM7XG5cbiAgbW9kZWwuaW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJHRVRcIiwgXG4gICAgICB1cmw6IGFyZ3MudXJsLCBcbiAgICAgIHR5cGU6IGFyZ3MudHlwZVxuICAgIH0pXG4gIH07XG4gIG1vZGVsLmdldCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0KHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsIFxuICAgICAgdXJsOiBhcmdzLnVybCArIFwiL1wiICsgaWQsXG4gICAgICB0eXBlOiBhcmdzLnR5cGVcbiAgICB9KVxuICB9O1xuICBtb2RlbC5jcmVhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0ICh7XG4gICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIHVybDogYXJncy51cmwsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgIH0pXG4gIH07XG4gIG1vZGVsLnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgIHVybDogYXJncy51cmwgKyBcIi9cIiArIGRhdGEuaWQoKSxcbiAgICAgIGRhdGE6IGRhdGEsXG4gICAgfSlcbiAgfTtcbiAgbW9kZWwuZGVsZXRlID0gZnVuY3Rpb24oaWQpIHtcbiAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgIHVybDogYXJncy51cmwgKyBcIi9cIiArIGlkLFxuICAgIH0pXG4gIH07XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbGF5b3V0KGNvbXBvbmVudCkge1xuICBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gICAgbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsIFxuICAgICAgdXJsOiBcIi9hcGkvbG9nb3V0XCIsIFxuICAgIH0pLnRoZW4oKHN1Y2Nlc3MpID0+IHt3aW5kb3cubG9jYXRpb24gPSBcIi9cIjt9KVxuICB9XG5cbiAgdmFyIGhlYWRlciA9IG0oXCJuYXYubmF2YmFyLm5hdmJhci1kZWZhdWx0XCIsIFtcbiAgICAgIG0oJy5uYXZiYXItaGVhZGVyJywgW1xuICAgICAgICBtKCdidXR0b24ubmF2YmFyLXRvZ2dsZS5jb2xsYXBzZWRbdHlwZT1cImJ1dHRvblwiIGRhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIiBkYXRhLXRhcmdldD1cIiNuYXZiYXItY29sbGFwc2VcIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIl0nLCBbXG4gICAgICAgICAgbSgnc3Bhbi5zci1vbmx5JywgXCJUb2dnbGUgbmF2aWdhdGlvblwiKSxcbiAgICAgICAgICBtKCdzcGFuLmljb24tYmFyJyksXG4gICAgICAgICAgbSgnc3Bhbi5pY29uLWJhcicpLFxuICAgICAgICAgIG0oJ3NwYW4uaWNvbi1iYXInKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnYS5uYXZiYXItYnJhbmRbaHJlZj1cIiNcIl0nLCBcItCf0LDQvdC10LvRjCDQsNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgNCwXCIpXG4gICAgICBdKSxcbiAgICAgIG0oJy5jb2xsYXBzZSBuYXZiYXItY29sbGFwc2UjbmF2YmFyLWNvbGxhcHNlJywgW1xuICAgICAgICBtKCd1bC5uYXYubmF2YmFyLW5hdi5uYXZiYXItcmlnaHQnLCBbXG4gICAgICAgICAgbSgnbGknLCBcbiAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9cIl0nLCBbXG4gICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGxheScpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgXCLQodCw0LnRglwiKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgKSxcbiAgICAgICAgICBtKCdsaScsIFxuICAgICAgICAgICAgbSgnYVtocmVmPVwiI1wiXScsIHtvbmNsaWNrOiBsb2dvdXR9LCBbXG4gICAgICAgICAgICAgIG0oJ2kuZmEuZmEtc2lnbi1vdXQnKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsIFwi0JLRi9C50YLQuFwiKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICAgICAgXSk7XG5cbiAgdmFyIG5hdmxpbmsgPSBmdW5jdGlvbiAodXJsLCB0aXRsZSkge1xuICAgIHJldHVybiBtKCdsaScsIHsgY2xhc3M6IChtLnJvdXRlKCkuaW5jbHVkZXModXJsKSkgPyBcImFjdGl2ZVwiIDogXCJcIiB9LCBtKCdhJywgeyBocmVmOiB1cmwsIGNvbmZpZzogbS5yb3V0ZSB9LCB0aXRsZSkpO1xuICB9XG4gIHZhciBzaWRlYmFyID0gW1xuICAgIG0oJy5wYW5lbC5wYW5lbC1kZWZhdWx0JywgW1xuICAgICAgICBtKCd1bC5uYXYgbmF2LXBpbGxzIG5hdi1zdGFja2VkJywgW1xuICAgICAgICAgIG5hdmxpbmsoXCIvY2F0ZWdvcmllc1wiLCBcItCa0LDRgtC10LPQvtGA0LjQuCDRgtC+0LLQsNGA0L7QslwiKSxcbiAgICAgICAgICBuYXZsaW5rKFwiL3Byb2R1Y3RzXCIsIFwi0KLQvtCy0LDRgNGLXCIpLFxuICAgICAgICAgIG5hdmxpbmsoXCIvcGFnZXNcIiwgXCLQodGC0YDQsNC90LjRhtGLXCIpLFxuICAgICAgICAgIG5hdmxpbmsoXCIvdXNlcnNcIiwgXCLQn9C+0LvRjNC30L7QstCw0YLQtdC70LhcIiksXG4gICAgICAgIF0pXG4gICAgXSlcbiAgXTtcblxuICByZXR1cm4gW1xuICAgIGhlYWRlcixcbiAgICBtKFwiI2NvbnRlbnQtd3JhcHBlclwiLCBbXG4gICAgICAgIG0oJyNzaWRlYmFyJywgc2lkZWJhciksXG4gICAgICAgIG0oJyNjb250ZW50JywgbS5jb21wb25lbnQoY29tcG9uZW50KSlcbiAgICBdKSxcbiAgXTtcbn07XG5cbmZ1bmN0aW9uIG1peGluTGF5b3V0KGxheW91dCwgY29tcG9uZW50KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGxheW91dChjb21wb25lbnQpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gIHJldHVybiB7IGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgpIHsgfSwgdmlldzogbWl4aW5MYXlvdXQobGF5b3V0LCBjb21wb25lbnQpIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNldENvb2tpZSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpLnNldENvb2tpZTtcblxudmFyIFBhZ2VTaXplU2VsZWN0b3IgPSB7fTtcblxuLy9hcmcgaXMgYW4gbS5wcm9wIG9mIHBhZ2VzaXplIGluIHRoZSBwYXJlbnQgY29udHJvbGxlclxuUGFnZVNpemVTZWxlY3Rvci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJnKSB7XG4gIHZhciBjdHJsID0gdGhpcztcbiAgY3RybC5zZXRwYWdlc2l6ZSA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICBhcmcoc2l6ZSk7XG4gICAgc2V0Q29va2llKFwicGFnZXNpemVcIiwgc2l6ZSwgMzY1KTsgLy9zdG9yZSBwYWdlc2l6ZSBpbiBjb29raWVzXG4gICAgbS5yZWRyYXcoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG59XG5cblBhZ2VTaXplU2VsZWN0b3IudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZykge1xuICByZXR1cm4gbSgnI3BhZ2VzaXplc2VsZWN0b3InLCBbXG4gICAgICBtKCdzcGFuJywgXCLQn9C+0LrQsNC30YvQstCw0YLRjCDQvdCwINGB0YLRgNCw0L3QuNGG0LU6IFwiKSxcbiAgICAgIFsxMCwgNTAsIDEwMCwgNTAwXS5tYXAoZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICByZXR1cm4gbSgnYVtocmVmPSNdJywge2NsYXNzOiAoc2l6ZSA9PSBhcmcoKSkgPyAnYWN0aXZlJyA6ICcnLCBvbmNsaWNrOiBjdHJsLnNldHBhZ2VzaXplLmJpbmQodGhpcywgc2l6ZSl9LCBzaXplKVxuICAgICAgfSlcbiAgXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnZVNpemVTZWxlY3RvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBhZ2VzID0gcmVxdWlyZSgnLi4vaGVscGVycy9mdW5jcycpLnBhZ2VzO1xudmFyIFBhZ2luYXRvciA9IHt9O1xuXG5QYWdpbmF0b3IuY29udHJvbGxlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBjdHJsLnNldHBhZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGFyZ3Mub25zZXRwYWdlKGluZGV4KTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuUGFnaW5hdG9yLnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gIHJldHVybiBtKCcjcGFnaW5hdG9yJywgXG4gICAgICAoYXJncy5saXN0KCkubGVuZ3RoID4gYXJncy5wYWdlc2l6ZSgpKVxuICAgICAgPyBtKCduYXYnLCBbXG4gICAgICAgIG0oJ3VsLnBhZ2luYXRpb24nLCBcbiAgICAgICAgICBwYWdlcyhhcmdzLmxpc3QoKS5sZW5ndGgsIGFyZ3MucGFnZXNpemUoKSlcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKHAsIGluZGV4KXtcbiAgICAgICAgICAgIHJldHVybiBtKCdsaScsIHtjbGFzczogKGluZGV4ID09IGFyZ3MuY3VycmVudHBhZ2UoKSkgPyAnYWN0aXZlJyA6ICcnfSwgXG4gICAgICAgICAgICAgICAgKGluZGV4ID09IGFyZ3MuY3VycmVudHBhZ2UoKSlcbiAgICAgICAgICAgICAgICA/IG0oJ3NwYW4nLCBpbmRleCsxKVxuICAgICAgICAgICAgICAgIDogbSgnYVtocmVmPS9dJywge29uY2xpY2s6IGN0cmwuc2V0cGFnZS5iaW5kKHRoaXMsIGluZGV4KX0sIGluZGV4KzEpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgIH0pXG4gICAgICAgICApXG4gICAgICBdKVxuICAgICAgOiBcIlwiXG4gICAgICApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIExvYWRpbmdTcGlubmVyID0ge307XG5cbkxvYWRpbmdTcGlubmVyLmNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHt9XG5Mb2FkaW5nU3Bpbm5lci52aWV3ID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gbSgnI2xvYWRpbmctc3Bpbm5lci5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICBtKCdwLnRleHQtY2VudGVyJywgbSgnaS5mYS5mYS1zcGluLmZhLWNvZy5mYS0zeCcpKSxcbiAgICAgIG0oJ3AudGV4dC1jZW50ZXInLCAn0J/QvtC00L7QttC00LjRgtC1LCDQuNC00LXRgiDQt9Cw0LPRgNGD0LfQutCwLi4uJylcbiAgXSk7XG59XG5cbnZhciBVcGRhdGluZ1NwaW5uZXIgPSB7fTtcblxuVXBkYXRpbmdTcGlubmVyLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7fVxuVXBkYXRpbmdTcGlubmVyLnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gIHJldHVybiBtKCcjdXBkYXRpbmctc3Bpbm5lci5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICBtKCdwI3NwaW5uZXItdGV4dCcsIG0oJ2kuZmEuZmEtc3Bpbi5mYS1jb2cuZmEtM3gnKSksXG4gIF0pO1xufVxuXG52YXIgU3Bpbm5lciA9IHt9O1xuU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY3RybCA9IHRoaXM7XG4gIGN0cmwuc3RhbmRhbG9uZSA9IChhcmdzICYmIGFyZ3Muc3RhbmRhbG9uZSkgPyB0cnVlIDogZmFsc2U7XG59XG5TcGlubmVyLnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gIHJldHVybiBtKCcjc3Bpbm5lcicsIFxuICAgICAgKGN0cmwuc3RhbmRhbG9uZSkgXG4gICAgICA/IG0uY29tcG9uZW50KExvYWRpbmdTcGlubmVyKSBcbiAgICAgIDogbS5jb21wb25lbnQoVXBkYXRpbmdTcGlubmVyKVxuICAgICAgKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaW5uZXI7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBEYXNoYm9hcmRDb21wb25lbnQgPSByZXF1aXJlKFwiLi9kYXNoYm9hcmRcIik7XG52YXIgQ2F0ZWdvcmllc0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL2NhdGVnb3J5L2NhdGVnb3JpZXNjb21wb25lbnRcIik7XG52YXIgQ2F0ZWdvcnlDb21wb25lbnQgPSByZXF1aXJlKFwiLi9jYXRlZ29yeS9jYXRlZ29yeWNvbXBvbmVudFwiKTtcbnZhciBQcm9kdWN0c0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3Byb2R1Y3QvcHJvZHVjdHNjb21wb25lbnRcIik7XG52YXIgUHJvZHVjdENvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3Byb2R1Y3QvcHJvZHVjdGNvbXBvbmVudFwiKTtcbnZhciBVc2Vyc0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3VzZXIvdXNlcnNjb21wb25lbnRcIik7XG52YXIgVXNlckNvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3VzZXIvdXNlcmNvbXBvbmVudFwiKTtcbnZhciBQYWdlc0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3BhZ2UvcGFnZXNjb21wb25lbnRcIik7XG52YXIgUGFnZUNvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3BhZ2UvcGFnZWNvbXBvbmVudFwiKTtcbnZhciBsYXlvdXQgPSByZXF1aXJlKFwiLi9sYXlvdXQvbGF5b3V0XCIpO1xuXG4vL3NldHVwIHJvdXRlcyB0byBzdGFydCB3LyB0aGUgYCNgIHN5bWJvbFxubS5yb3V0ZS5tb2RlID0gXCJoYXNoXCI7XG5cbm0ucm91dGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZG1pbi1hcHBcIiksIFwiL1wiLCB7XG4gIFwiL1wiOiBsYXlvdXQoRGFzaGJvYXJkQ29tcG9uZW50KSxcbiAgXCIvdXNlcnNcIjogbGF5b3V0KFVzZXJzQ29tcG9uZW50KSxcbiAgXCIvdXNlcnMvOmlkXCI6IGxheW91dChVc2VyQ29tcG9uZW50KSxcbiAgXCIvcGFnZXNcIjogbGF5b3V0KFBhZ2VzQ29tcG9uZW50KSxcbiAgXCIvcGFnZXMvOmlkXCI6IGxheW91dChQYWdlQ29tcG9uZW50KSxcbiAgXCIvY2F0ZWdvcmllc1wiOiBsYXlvdXQoQ2F0ZWdvcmllc0NvbXBvbmVudCksXG4gIFwiL2NhdGVnb3JpZXMvOmlkXCI6IGxheW91dChDYXRlZ29yeUNvbXBvbmVudCksXG4gIFwiL3Byb2R1Y3RzXCI6IGxheW91dChQcm9kdWN0c0NvbXBvbmVudCksXG4gIFwiL3Byb2R1Y3RzLzppZFwiOiBsYXlvdXQoUHJvZHVjdENvbXBvbmVudCksXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5zbHVnID0gbS5wcm9wKGRhdGEuc2x1ZyB8fCAnJyk7XG4gIHRoaXMuY29udGVudCA9IG0ucHJvcChkYXRhLmNvbnRlbnQgfHwgJycpO1xuICB0aGlzLnB1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLnB1Ymxpc2hlZCB8fCB0cnVlKTtcbiAgdGhpcy5tZXRhX2Rlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEubWV0YV9kZXNjcmlwdGlvbiB8fCAnJyk7XG4gIHRoaXMubWV0YV9rZXl3b3JkcyA9IG0ucHJvcChkYXRhLm1ldGFfa2V5d29yZHMgfHwgJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvbW9kZWwnKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZSgnLi4vbGF5b3V0L3NwaW5uZXInKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3InKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKCcuLi9sYXlvdXQvcGFnaW5hdG9yJyk7XG52YXIgUGFnZSA9IHJlcXVpcmUoJy4vcGFnZScpO1xudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvci9lZGl0b3Jjb21wb25lbnQnKTtcblxuXG52YXIgUGFnZUNvbXBvbmVudCA9IHt9O1xuUGFnZUNvbXBvbmVudC52bSA9IHt9O1xuUGFnZUNvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wYWdlc1wiLCB0eXBlOiBQYWdlfSk7XG4gIGlmIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIikge1xuICAgIHZtLnJlY29yZCA9IG0ucHJvcChuZXcgUGFnZSgpKTtcbiAgfSBlbHNlIHtcbiAgICB2bS5yZWNvcmQgPSAgdm0ubW9kZWwuZ2V0KG0ucm91dGUucGFyYW0oXCJpZFwiKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5QYWdlQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gUGFnZUNvbXBvbmVudC52bS5pbml0KCk7XG4gIGlmIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIikge1xuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AoZmFsc2UpO1xuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQvtC30LTQsNC90LjQtSDRgdGC0YDQsNC90LjRhtGLXCI7XG4gIH0gZWxzZSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gICAgY3RybC52bS5yZWNvcmQudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgNGC0L7Rh9C60LAg0YHRgtGA0LDQvdC40YbRi1wiO1xuICB9XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpOyAvL25vdGlmaWNhdGlvbnNcblxuICBjdHJsLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIG0ucm91dGUoXCIvcGFnZXNcIik7XG4gIH1cbiAgY3RybC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwudm0ucmVjb3JkKCkpXG4gICAgICAudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7Y3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyk7fSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvcikge2N0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO30pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKX0pO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC5tZXNzYWdlKCcnKTtcbiAgICBjdHJsLmVycm9yKCcnKTtcbiAgICBjdHJsLnZtLm1vZGVsLmNyZWF0ZShjdHJsLnZtLnJlY29yZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge20ucm91dGUoXCIvcGFnZXNcIik7fSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfSk7XG4gIH1cbn1cblBhZ2VDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgLy9jb21wbGV0ZSB2aWV3XG4gIHJldHVybiBtKFwiI3BhZ2Vjb21wb25lbnRcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgY3RybC52bS5yZWNvcmQoKVxuICAgICAgPyBtKCdmb3JtLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JfQsNCz0L7Qu9C+0LLQvtC6JyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm5hbWUoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm5hbWUpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ch0L7QtNC10YDQttCw0L3QuNC1JyksXG4gICAgICAgICAgbS5jb21wb25lbnQoRWRpdG9yLCB7dGV4dDogY3RybC52bS5yZWNvcmQoKS5jb250ZW50fSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cc0LXRgtCwINC+0L/QuNGB0LDQvdC40LUnKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkubWV0YV9kZXNjcmlwdGlvbigpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkubWV0YV9kZXNjcmlwdGlvbil9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JzQtdGC0LAg0LrQu9GO0YfQtdCy0LjQutC4JyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm1ldGFfa2V5d29yZHMoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm1ldGFfa2V5d29yZHMpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ce0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywge2NoZWNrZWQ6IGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKCksIG9uY2xpY2s6IG0ud2l0aEF0dHIoXCJjaGVja2VkXCIsIGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKX0pXG4gICAgICAgIF0pLFxuICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgKGN0cmwuZXJyb3IoKSkgPyBtKCcuYWN0aW9uLWFsZXJ0LmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5lcnJvcigpKSA6IFwiXCIsXG4gICAgICAgIG0oJy5hY3Rpb25zJywgW1xuICAgICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIilcbiAgICAgICAgICA/IG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC5jcmVhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xuICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0LfQtNCw0YLRjCcpXG4gICAgICAgICAgXSlcbiAgICAgICAgICA6IFtcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5W3R5cGU9XCJzdWJtaXRcIl0nLCB7IG9uY2xpY2s6IGN0cmwudXBkYXRlLCBkaXNhYmxlZDogY3RybC51cGRhdGluZygpIH0sIFtcbiAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLWRhbmdlcicsIHsgb25jbGljazogY3RybC5jYW5jZWwgfSwgW1xuICAgICAgICAgICAgbSgnaS5mYS5mYS10aW1lcycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQntGC0LzQtdC90LAnKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyLCB7c3RhbmRhbG9uZTogdHJ1ZX0pXG4gICAgXSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBQYWdlID0gcmVxdWlyZShcIi4vcGFnZVwiKTtcblxudmFyIFBhZ2VzQ29tcG9uZW50ID0ge307XG5QYWdlc0NvbXBvbmVudC52bSA9IHt9O1xuUGFnZXNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wYWdlc1wiLCB0eXBlOiBQYWdlfSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cblBhZ2VzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gUGFnZXNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INGB0YLRgNCw0L3QuNGGXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZnVuY3MuZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvcGFnZXMvXCIrcm93LmlkKCkpO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9wYWdlcy9uZXdcIik7XG4gIH1cbiAgY3RybC5zaG93ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICB3aW5kb3cubG9jYXRpb24gPSBcIi9wYWdlL1wiICsgcm93LmlkKCkgKyBcIi1cIiArIHJvdy5zbHVnKCk7XG4gIH1cbiAgY3RybC5kZWxldGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KCk7XG4gICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjdHJsLmN1cnJlbnRwYWdlKCkrMSA+IGZ1bmNzLnBhZ2VzKGN0cmwudm0ubGlzdCgpLmxlbmd0aCwgY3RybC5wYWdlc2l6ZSgpKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY3RybC5jdXJyZW50cGFnZShNYXRoLm1heChjdHJsLmN1cnJlbnRwYWdlKCktMSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG59XG5QYWdlc0NvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LFxuICAgICAgICBbXG4gICAgICAgIG0oJ3RkJywgZGF0YS5uYW1lKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLnB1Ymxpc2hlZCgpID8gbSgnaS5mYS5mYS1jaGVjaycpIDogbSgnaS5mYS5mYS10aW1lcycpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLFtcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXBlbmNpbCcpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3Qn9GA0L7RgdC80L7RgtGAXScsIHtvbmNsaWNrOiBjdHJsLnNob3cuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtZXllJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKVxuICAgICAgICBdKVxuICAgICAgICBdXG4gICAgICAgICk7XG4gIH0gLy9zaG93Um93VGVtcGxhdGVcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjcGFnZXNjb21wb25lbnRcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JywgW1xuICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIGZ1bmNzLnNvcnRzKGN0cmwudm0ubGlzdCgpKSwgW1xuICAgICAgICAgIG0oJ3RoZWFkJywgXG4gICAgICAgICAgICBtKCd0cicsIFtcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQl9Cw0LPQvtC70L7QstC+0LonKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9cHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90L4nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyKVxuICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5jcmVhdGUgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDRgdGC0YDQsNC90LjRhtGDJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgY3RybC52bS5saXN0KCkgPyBtLmNvbXBvbmVudChQYWdpbmF0b3IsIHtsaXN0OiBjdHJsLnZtLmxpc3QsIHBhZ2VzaXplOiBjdHJsLnBhZ2VzaXplLCBjdXJyZW50cGFnZTogY3RybC5jdXJyZW50cGFnZSwgb25zZXRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlfSkgOiBcIlwiLFxuICAgICAgICAgIF0pXG4gICAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlc0NvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKXtcbiAgZGF0YSA9IGRhdGEgfHwge307XG4gIHRoaXMuaWQgPSBtLnByb3AoZGF0YS5pZCB8fCAwKTtcbiAgdGhpcy5uYW1lID0gbS5wcm9wKGRhdGEubmFtZSB8fCAnJyk7XG4gIHRoaXMuc2x1ZyA9IG0ucHJvcChkYXRhLnNsdWcgfHwgJycpO1xuICB0aGlzLmNvbnRlbnQgPSBtLnByb3AoZGF0YS5jb250ZW50IHx8ICcnKTtcbiAgdGhpcy5pbWFnZSA9IG0ucHJvcChkYXRhLmltYWdlIHx8ICcnKTtcbiAgdGhpcy5wdWJsaXNoZWQgPSBtLnByb3AoZGF0YS5wdWJsaXNoZWQgfHwgdHJ1ZSk7XG4gIHRoaXMucHJpY2UgPSBtLnByb3AoZGF0YS5wcmljZSB8fCBudWxsKTtcbiAgdGhpcy5jYXRlZ29yeV9uYW1lID0gbS5wcm9wKChkYXRhLmNhdGVnb3J5KSA/IGRhdGEuY2F0ZWdvcnkubmFtZSA6ICcnKTtcbiAgdGhpcy5jYXRlZ29yeV9pZCA9IG0ucHJvcChkYXRhLmNhdGVnb3J5X2lkIHx8IDApO1xuICB0aGlzLm1ldGFfZGVzY3JpcHRpb24gPSBtLnByb3AoZGF0YS5tZXRhX2Rlc2NyaXB0aW9uIHx8ICcnKTtcbiAgdGhpcy5tZXRhX2tleXdvcmRzID0gbS5wcm9wKGRhdGEubWV0YV9rZXl3b3JkcyB8fCAnJyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIENhdGVnb3J5U2VsZWN0ID0gcmVxdWlyZShcIi4uL2NhdGVnb3J5L2NhdGVnb3J5c2VsZWN0XCIpO1xudmFyIFByb2R1Y3QgPSByZXF1aXJlKFwiLi9wcm9kdWN0XCIpO1xudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvci9lZGl0b3Jjb21wb25lbnQnKTtcblxudmFyIFByb2R1Y3RDb21wb25lbnQgPSB7fTtcblByb2R1Y3RDb21wb25lbnQudm0gPSB7fTtcblByb2R1Y3RDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvcHJvZHVjdHNcIiwgdHlwZTogUHJvZHVjdH0pO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICB2bS5yZWNvcmQgPSBtLnByb3AobmV3IFByb2R1Y3QoKSk7XG4gIH0gZWxzZSB7XG4gICAgdm0ucmVjb3JkID0gIHZtLm1vZGVsLmdldChtLnJvdXRlLnBhcmFtKFwiaWRcIikpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuUHJvZHVjdENvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgY3RybC52bSA9IFByb2R1Y3RDb21wb25lbnQudm0uaW5pdCgpO1xuICBpZiAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpIHtcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKTtcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCh0L7Qt9C00LDQvdC40LUg0YLQvtCy0LDRgNCwXCI7XG4gIH0gZWxzZSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gICAgY3RybC52bS5yZWNvcmQudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgNGC0L7Rh9C60LAg0YLQvtCy0LDRgNCwXCI7XG4gIH1cbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG4gIGN0cmwubWVzc2FnZSA9IG0ucHJvcCgnJyk7IC8vbm90aWZpY2F0aW9uc1xuXG4gIGN0cmwuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgbS5yb3V0ZShcIi9wcm9kdWN0c1wiKTtcbiAgfVxuICBjdHJsLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC51cGRhdGUoY3RybC52bS5yZWNvcmQoKSlcbiAgICAgIC50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtjdHJsLm1lc3NhZ2UoJ9CY0LfQvNC10L3QtdC90LjRjyDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnKTt9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7Y3RybC5lcnJvcihmdW5jcy5wYXJzZUVycm9yKGVycm9yKSk7fSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpfSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwuY3JlYXRlKGN0cmwudm0ucmVjb3JkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7bS5yb3V0ZShcIi9wcm9kdWN0c1wiKTt9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9KTtcbiAgfVxufVxuUHJvZHVjdENvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjcHJvZHVjdGNvbXBvbmVudFwiLCBbXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBjdHJsLnZtLnJlY29yZCgpXG4gICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQndCw0LfQstCw0L3QuNC1JyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm5hbWUoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm5hbWUpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5yb3cnLCBbXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAgY29sLXNtLTYnLCBbXG4gICAgICAgICAgICBtKCdsYWJlbCcsICfQmtCw0YLQtdCz0L7RgNC40Y8nKSxcbiAgICAgICAgICAgIG0uY29tcG9uZW50KENhdGVnb3J5U2VsZWN0LCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkuY2F0ZWdvcnlfaWQsIGVycm9yOiBjdHJsLmVycm9yfSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAgY29sLXNtLTYnLCBbXG4gICAgICAgICAgICBtKCdsYWJlbCcsICfQptC10L3QsCcpLFxuICAgICAgICAgICAgbSgnLmlucHV0LWdyb3VwJywgW1xuICAgICAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2xbdHlwZT1udW1iZXJdW3N0ZXA9MC4wMV0nLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkucHJpY2UoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLnByaWNlKX0pLFxuICAgICAgICAgICAgICBtKCdzcGFuLmlucHV0LWdyb3VwLWFkZG9uJywgJ9GALicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0KHQvtC00LXRgNC20LDQvdC40LUnKSxcbiAgICAgICAgICBtLmNvbXBvbmVudChFZGl0b3IsIHt0ZXh0OiBjdHJsLnZtLnJlY29yZCgpLmNvbnRlbnR9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JzQtdGC0LAg0L7Qv9C40YHQsNC90LjQtScpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5tZXRhX2Rlc2NyaXB0aW9uKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5tZXRhX2Rlc2NyaXB0aW9uKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQnNC10YLQsCDQutC70Y7Rh9C10LLQuNC60LgnKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkubWV0YV9rZXl3b3JkcygpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkubWV0YV9rZXl3b3Jkcyl9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMJyksXG4gICAgICAgICAgbSgnaW5wdXRbdHlwZT1jaGVja2JveF0nLCB7Y2hlY2tlZDogY3RybC52bS5yZWNvcmQoKS5wdWJsaXNoZWQoKSwgb25jbGljazogbS53aXRoQXR0cihcImNoZWNrZWRcIiwgY3RybC52bS5yZWNvcmQoKS5wdWJsaXNoZWQpfSlcbiAgICAgICAgXSksXG4gICAgICAgIChjdHJsLm1lc3NhZ2UoKSkgPyBtKCcuYWN0aW9uLW1lc3NhZ2UuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLm1lc3NhZ2UoKSkgOiBcIlwiLFxuICAgICAgICAoY3RybC5lcnJvcigpKSA/IG0oJy5hY3Rpb24tYWxlcnQuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLmVycm9yKCkpIDogXCJcIixcbiAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKVxuICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXG4gICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7Qt9C00LDRgtGMJylcbiAgICAgICAgICBdKVxuICAgICAgICAgIDogW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC51cGRhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xuICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0YXRgNCw0L3QuNGC0YwnKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tZGFuZ2VyJywgeyBvbmNsaWNrOiBjdHJsLmNhbmNlbCB9LCBbXG4gICAgICAgICAgICBtKCdpLmZhLmZhLXRpbWVzJyksXG4gICAgICAgICAgICBtKCdzcGFuJywgJ9Ce0YLQvNC10L3QsCcpXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcbiAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9kdWN0Q29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBQcm9kdWN0ID0gcmVxdWlyZShcIi4vcHJvZHVjdFwiKTtcblxudmFyIFByb2R1Y3RzQ29tcG9uZW50ID0ge307XG5Qcm9kdWN0c0NvbXBvbmVudC52bSA9IHt9O1xuUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wcm9kdWN0c1wiLCB0eXBlOiBQcm9kdWN0fSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cblByb2R1Y3RzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZnVuY3MuZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuc2hvdyA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgd2luZG93LmxvY2F0aW9uID0gXCIvcHJvZHVjdC9cIiArIHJvdy5pZCgpICsgXCItXCIgKyByb3cuc2x1ZygpO1xuICB9XG4gIGN0cmwuZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvcHJvZHVjdHMvXCIrcm93LmlkKCkpO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9wcm9kdWN0cy9uZXdcIik7XG4gIH1cbiAgY3RybC5kZWxldGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KCk7XG4gICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjdHJsLmN1cnJlbnRwYWdlKCkrMSA+IGZ1bmNzLnBhZ2VzKGN0cmwudm0ubGlzdCgpLmxlbmd0aCwgY3RybC5wYWdlc2l6ZSgpKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY3RybC5jdXJyZW50cGFnZShNYXRoLm1heChjdHJsLmN1cnJlbnRwYWdlKCktMSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgKTtcbiAgfVxufVxuUHJvZHVjdHNDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgdmFyIHNob3dSb3dUZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbSgndHIuY2xpY2thYmxlJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgW1xuICAgICAgICBtKCd0ZC5zaHJpbmsnLCAoZGF0YS5pbWFnZSgpKSA/IG0oJ2ltZy5pbWFnZS1wcmV2aWV3LmltZy1yZXNwb25zaXZlJywge3NyYzogZGF0YS5pbWFnZSgpfSkgOiBcIlwiKSxcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuY2F0ZWdvcnlfbmFtZSgpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLnRleHQtY2VudGVyJywgZGF0YS5wdWJsaXNoZWQoKSA/IG0oJ2kuZmEuZmEtY2hlY2snKSA6IG0oJ2kuZmEuZmEtdGltZXMnKSksXG4gICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJyxbXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90KDQtdC00LDQutGC0LjRgNC+0LLQsNGC0YxdJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90J/RgNC+0YHQvNC+0YLRgF0nLCB7b25jbGljazogY3RybC5zaG93LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLWV5ZScpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGFuZ2VyW3RpdGxlPdCj0LTQsNC70LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmRlbGV0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1yZW1vdmUnKSlcbiAgICAgICAgXSlcbiAgICAgICAgXVxuICAgICAgICApO1xuICB9IC8vc2hvd1Jvd1RlbXBsYXRlXG5cbiAgLy9jb21wbGV0ZSB2aWV3XG4gIHJldHVybiBtKFwiI3Byb2R1Y3RsaXN0XCIsIFtcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBmdW5jcy5zb3J0cyhjdHJsLnZtLmxpc3QoKSksIFtcbiAgICAgICAgICBtKCd0aGVhZCcsIFxuICAgICAgICAgICAgbSgndHInLCBbXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aW1hZ2VdJywgJ9Ck0L7RgtC+JyksXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9bmFtZV0nLCAn0J3QsNC30LLQsNC90LjQtScpLFxuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWNhdGVnb3J5X25hbWVdJywgJ9Ca0LDRgtC10LPQvtGA0LjRjycpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1wdWJsaXNoZWRdJywgJ9Ce0L/Rg9Cx0LvQuNC60L7QstCw0L3QsCcpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuYWN0aW9ucycsICcjJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICksXG4gICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAvL2lmIHJlY29yZCBsaXN0IGlzIHJlYWR5LCBlbHNlIHNob3cgc3Bpbm5lclxuICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAvL3NsaWNlIGZpbHRlcnMgcmVjb3JkcyBmcm9tIGN1cnJlbnQgcGFnZSBvbmx5XG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLnNsaWNlKGN0cmwuY3VycmVudHBhZ2UoKSpjdHJsLnBhZ2VzaXplKCksIChjdHJsLmN1cnJlbnRwYWdlKCkrMSkqY3RybC5wYWdlc2l6ZSgpKVxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHNob3dSb3dUZW1wbGF0ZShkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICghY3RybC52bS5saXN0KCkubGVuZ3RoKSBcbiAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxuICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgY3RybC51cGRhdGluZygpID8gbS5jb21wb25lbnQoU3Bpbm5lcikgOiBcIlwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIpXG4gICAgICAgICAgICksIC8vdGJvZHlcbiAgICAgICAgICBdKSwgLy90YWJsZVxuICAgICAgICAgIG0oJy5hY3Rpb25zJywgW1xuICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5JywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSB9LCBbXG4gICAgICAgICAgICAgICAgbSgnaS5mYS5mYS1wbHVzJyksXG4gICAgICAgICAgICAgICAgbSgnc3BhbicsICfQlNC+0LHQsNCy0LjRgtGMINGC0L7QstCw0YAnKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2R1Y3RzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5lbWFpbCA9IG0ucHJvcChkYXRhLmVtYWlsIHx8ICcnKTtcbiAgdGhpcy5jdXJyZW50X3Bhc3N3b3JkID0gbS5wcm9wKGRhdGEuY3VycmVudF9wYXNzd29yZCB8fCAnJyk7XG4gIHRoaXMucGFzc3dvcmQgPSBtLnByb3AoZGF0YS5wYXNzd29yZCB8fCAnJyk7XG4gIHRoaXMucGFzc3dvcmRfY29uZmlybSA9IG0ucHJvcChkYXRhLnBhc3N3b3JkX2NvbmZpcm0gfHwgJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi91c2VyJyk7XG5cbnZhciBVc2VyQ29tcG9uZW50ID0ge307XG5Vc2VyQ29tcG9uZW50LnZtID0ge307XG5Vc2VyQ29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3VzZXJzXCIsIHR5cGU6IFVzZXJ9KTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgdm0ucmVjb3JkID0gbS5wcm9wKG5ldyBVc2VyKCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblVzZXJDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBVc2VyQ29tcG9uZW50LnZtLmluaXQoKTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcChmYWxzZSk7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC+0LfQtNCw0L3QuNC1INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiO1xuICB9IGVsc2Uge1xuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICAgIGN0cmwudm0ucmVjb3JkLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YDRgtC+0YfQutCwINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiO1xuICB9XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpOyAvL25vdGlmaWNhdGlvbnNcblxuICBjdHJsLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIG0ucm91dGUoXCIvdXNlcnNcIik7XG4gIH1cbiAgY3RybC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwudm0ucmVjb3JkKCkpXG4gICAgICAudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7Y3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyk7fSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvcikge2N0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO31cbiAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KTtcbiAgfVxuICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC52bS5yZWNvcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHsgbS5yb3V0ZShcIi91c2Vyc1wiKTt9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbn1cblVzZXJDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgLy9jb21wbGV0ZSB2aWV3XG4gIHJldHVybiBtKFwiI3VzZXJcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgY3RybC52bS5yZWNvcmQoKVxuICAgICAgPyBtKCdmb3JtLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JjQvNGPJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLm5hbWUoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLm5hbWUpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ct0LsuINC/0L7Rh9GC0LAnKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2xbdHlwZT1lbWFpbF0nLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkuZW1haWwoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLmVtYWlsKX0pXG4gICAgICAgIF0pLFxuICAgICAgICAobS5yb3V0ZS5wYXJhbShcImlkXCIpICE9IFwibmV3XCIpXG4gICAgICAgID8gbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0KLQtdC60YPRidC40Lkg0L/QsNGA0L7Qu9GMJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9cGFzc3dvcmRdJywge3BsYWNlaG9sZGVyOiBcItCe0YHRgtCw0LLRjNGC0LUg0L/Rg9GB0YLRi9C8LCDRh9GC0L7QsdGLINGB0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQuSDQv9Cw0YDQvtC70YxcIiwgdmFsdWU6IGN0cmwudm0ucmVjb3JkKCkuY3VycmVudF9wYXNzd29yZCgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkuY3VycmVudF9wYXNzd29yZCl9KVxuICAgICAgICBdKVxuICAgICAgICA6IFwiXCIsXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cd0L7QstGL0Lkg0L/QsNGA0L7Qu9GMJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9cGFzc3dvcmRdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLnBhc3N3b3JkKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5wYXNzd29yZCl9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J/QvtC00YLQstC10YDQttC00LXQvdC40LUg0L/QsNGA0L7Qu9GPJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9cGFzc3dvcmRdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLnBhc3N3b3JkX2NvbmZpcm0oKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLnBhc3N3b3JkX2NvbmZpcm0pfSlcbiAgICAgICAgXSksXG4gICAgICAgIChjdHJsLm1lc3NhZ2UoKSkgPyBtKCcuYWN0aW9uLW1lc3NhZ2UuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLm1lc3NhZ2UoKSkgOiBcIlwiLFxuICAgICAgICAoY3RybC5lcnJvcigpKSA/IG0oJy5hY3Rpb24tYWxlcnQuYW5pbWF0ZWQuZmFkZUluUmlnaHQnLCBjdHJsLmVycm9yKCkpIDogXCJcIixcbiAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpXG4gICAgICAgICAgICA/IG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC5jcmVhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xuICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtC30LTQsNGC0YwnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLnVwZGF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXG4gICAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0YXRgNCw0L3QuNGC0YwnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tZGFuZ2VyJywgeyBvbmNsaWNrOiBjdHJsLmNhbmNlbCB9LCBbXG4gICAgICAgICAgICAgIG0oJ2kuZmEuZmEtdGltZXMnKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsICfQntGC0LzQtdC90LAnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lciwge3N0YW5kYWxvbmU6IHRydWV9KVxuICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIFVzZXIgPSByZXF1aXJlKFwiLi91c2VyXCIpO1xuXG52YXIgVXNlcnNDb21wb25lbnQgPSB7fTtcblVzZXJzQ29tcG9uZW50LnZtID0ge307XG5Vc2Vyc0NvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3VzZXJzXCIsIHR5cGU6IFVzZXJ9KTtcbiAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KCk7XG4gIHJldHVybiB0aGlzO1xufVxuVXNlcnNDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBVc2Vyc0NvbXBvbmVudC52bS5pbml0KCk7XG4gIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC/0LjRgdC+0Log0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10LlcIjtcbiAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChmdW5jcy5nZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCk7IC8vbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlXG4gIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCk7IC8vY3VycmVudCBwYWdlLCBzdGFydGluZyB3aXRoIDBcbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5lZGl0ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi91c2Vycy9cIityb3cuaWQoKSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL3VzZXJzL25ld1wiKTtcbiAgfVxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKTtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gZnVuY3MucGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG59XG5Vc2Vyc0NvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LFxuICAgICAgICBbXG4gICAgICAgIG0oJ3RkJywgZGF0YS5lbWFpbCgpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rJywgZGF0YS5uYW1lKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKVxuICAgICAgICBdKVxuICAgICAgICBdXG4gICAgICAgICk7XG4gIH0gLy9zaG93Um93VGVtcGxhdGVcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjdXNlcmxpc3RcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JywgW1xuICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIGZ1bmNzLnNvcnRzKGN0cmwudm0ubGlzdCgpKSwgW1xuICAgICAgICAgIG0oJ3RoZWFkJywgXG4gICAgICAgICAgICBtKCd0cicsIFtcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1lbWFpbF0nLCAn0K3Quy4g0L/QvtGH0YLQsCcpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQmNC80Y8nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyKVxuICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5jcmVhdGUgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJzQ29tcG9uZW50O1xuIl19
