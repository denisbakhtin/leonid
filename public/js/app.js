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
  ctrl.editingid = m.prop(''); //id of the row, that is being edited
  ctrl.record = m.prop(''); //temporary state of the row, that is being edited
  ctrl.pagesize = m.prop(funcs.getCookie("pagesize") || 10); //number of items per page
  ctrl.currentpage = m.prop(0); //current page, starting with 0
  ctrl.error = m.prop('');

  ctrl.startedit = function(row) {
    ctrl.editingid(row.id());
    ctrl.record = new Category({id: row.id(), isPublished: row.ispublished(), name: row.name()});
  }
  ctrl.update = function(row) {
    ctrl.updating(true);
    m.redraw();
    ctrl.vm.model.update(ctrl.record)
      .then(
          function(success) {
            ctrl.editingid('');
            ctrl.vm.list()[ctrl.vm.list().indexOf(row)] = ctrl.record; //update current row in grid
          },
          function(error) {ctrl.error(funcs.parseError(error))}
          ).then(function() {ctrl.updating(false); m.redraw()});
  }
  ctrl.startcreate = function() {
    ctrl.editingid('new');
    ctrl.record = new Category({id: 0, isPublished: true, name: ''});
  }
  ctrl.create = function() {
    ctrl.updating(true);
    m.redraw();
    ctrl.vm.model.create(ctrl.record).then(
        function(success) {
          ctrl.vm.list = ctrl.vm.model.index();
          ctrl.vm.list.then(function(){
            ctrl.editingid('');
            ctrl.updating(false); 
            m.redraw()
          })
        },
        function(error) {
          ctrl.error(funcs.parseError(error));
          ctrl.updating(false); 
          m.redraw();
        }
        );
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
  ctrl.canceledit = function(){ ctrl.editingid('') }
}
CategoriesComponent.view = function (ctrl) {

  var editRowTemplate = function(data) {
    return [
      m('tr', {
        config: function(el, init) {
          if( !init ) {
            el.onkeyup = function(e) {
              if (e.keyCode == 13) ctrl.update(data)
                if (e.keyCode == 27) { ctrl.canceledit(); m.redraw(); }
            }
          }
        }
      },
      [
      m('td.shrink', ctrl.record.id()),
      m('td', m('input.form-control', {
        config: function(el, init) {
          if( !init ) el.focus()
        },
        value: ctrl.record.name(), 
        onchange: m.withAttr("value", ctrl.record.name)
      })),
      m('td.shrink',
        m('input[type=checkbox]', { checked: ctrl.record.ispublished(), onclick: m.withAttr("checked", ctrl.record.ispublished)})
       ),
      m('td.shrink.actions', [
          m('button.btn.btn-sm.btn-default[title=Сохранить]', {onclick: ctrl.update.bind(this, data)}, m('i.fa.fa-check')),
          m('button.btn.btn-sm.btn-default[title=Отмена]', {onclick: ctrl.canceledit}, m('i.fa.fa-times'))
      ])
      ]), //tr
      ctrl.error()
        ? m('tr.error.animated.fadeIn', [
            m('td'),
            m('td.text-danger[colspan=2]', ctrl.error()),
            m('td')
        ])
        : ""
        ];
  } //editRowTemplate

  var showRowTemplate = function(data) {
    return m('tr.clickable', {onclick: ctrl.startedit.bind(this, data)},
        [
        m('td.shrink', data.id()),
        m('td', data.name()),
        m('td.shrink.text-center', data.ispublished() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.startedit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
        ])
        ]
        );
  } //showRowTemplate

  var createTemplate = function(data) {
    return [
      m('tr', {
        config: function(el, init) {
          if( !init ) {
            el.onkeyup = function(e) {
              if (e.keyCode == 13) ctrl.create()
                if (e.keyCode == 27) { ctrl.canceledit(); m.redraw(); return }
            }
          }
        }
      },
      [
      m('td.shrink'),
      m('td', m('input.form-control', {
        config: function(el, init) {
          if( !init ) el.focus()
        },
        value: ctrl.record.name(), 
        onchange: m.withAttr("value", ctrl.record.name)
      })),
      m('td.shrink',
        m('input[type=checkbox]', { checked: ctrl.record.ispublished(), onclick: m.withAttr("checked", ctrl.record.ispublished)})
       ),
      m('td.shrink.actions', [
          m('button.btn.btn-sm.btn-default[title=Создать]', {onclick: ctrl.create}, m('i.fa.fa-check')),
          m('button.btn.btn-sm.btn-default[title=Отмена]', {onclick: ctrl.canceledit}, m('i.fa.fa-times'))
      ])
      ]
      ), //tr
      ctrl.error()
        ? m('tr.error.animated.fadeIn', [
            m('td'),
            m('td.text-danger[colspan=2]', ctrl.error()),
            m('td')
        ])
        : ""
        ];
  } //createTemplate

  //complete view
  return m("#categorylist", [
      m("h1", ctrl.title),
      m('div', [
        m('table.table.table-striped.animated.fadeIn', sorts(ctrl.vm.list()), [
          m('thead', 
            m('tr', [
              m('th.shrink.clickable[data-sort-by=id]', '№'),
              m('th.clickable[data-sort-by=name]', 'Название'),
              m('th.shrink.clickable[data-sort-by=ispublished]', 'Опубликована'),
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
              return (ctrl.editingid() == data.id()) ? editRowTemplate(data) : showRowTemplate(data)
            }
            ),
            (!ctrl.vm.list().length) 
            ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.'))
            : "",
            (ctrl.editingid() == "new") ? createTemplate() : "",
            ctrl.updating() ? m.component(Spinner) : ""
            ]
            : m.component(Spinner)
           ), //tbody
          ]), //table
          m('.actions', [
              m('button.btn.btn-primary', { onclick: ctrl.startcreate }, [
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./category":2}],2:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.is_published = m.prop(data.is_published || false);
}

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
      url: args.url + "/" + data().id(),
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


},{"./funcs":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"../helpers/funcs":4}],8:[function(require,module,exports){
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

},{"../helpers/funcs":4}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';
/*global m */

var DashboardComponent = require("./dashboard");
var CategoriesComponent = require("./category/categoriescomponent");
var ProductsComponent = require("./product/productscomponent");
var ProductComponent = require("./product/product");
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
  "/products": layout(ProductsComponent),
  "/products/:id": layout(ProductComponent),
});

},{"./category/categoriescomponent":1,"./dashboard":3,"./layout/layout":6,"./page/pagecomponent":12,"./page/pagescomponent":13,"./product/product":14,"./product/productscomponent":15,"./user/usercomponent":17,"./user/userscomponent":18}],11:[function(require,module,exports){
'use strict';


module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.slug = m.prop(data.slug || '');
  this.content = m.prop(data.content || '');
  this.published = m.prop(data.published || true);
}

},{}],12:[function(require,module,exports){
'use strict';
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
        function(success) {m.route("/pages");},
        function(error) {
          ctrl.error(funcs.parseError(error));
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./page":11}],13:[function(require,module,exports){
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
        m('td.shrink', data.slug()),
        m('td.shrink', data.published() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.edit.bind(this, data)}, m('i.fa.fa-pencil')),
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
              m('th.shrink.clickable[data-sort-by=slug]', 'Кор. адрес'),
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./page":11}],14:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.ispublished = m.prop(data.isPublished || false);
  this.categoryname = m.prop(data.categoryName || '');
  this.categoryid = m.prop(data.categoryId || 0);
  this.description = m.prop(data.description || '');
  this.image = m.prop(data.image || '');
  this.price = m.prop(data.price || null);
}

},{}],15:[function(require,module,exports){
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
  ctrl.pagesize = m.prop(getCookie("pagesize") || 10); //number of items per page
  ctrl.currentpage = m.prop(0); //current page, starting with 0
  ctrl.error = m.prop('');

  ctrl.startedit = function(row) {
    console.log('Use m.route to redirect');
  }
  ctrl.startcreate = function(row) {
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
    return m('tr.clickable', {onclick: ctrl.startedit.bind(this, data)},
        [
        m('td.shrink', data.id()),
        m('td.shrink', (data.image()) ? m('img.image-preview.img-responsive', {src: data.image()}) : ""),
        m('td', data.name()),
        m('td.shrink', data.categoryname()),
        m('td.shrink.text-center', data.ispublished() ? m('i.fa.fa-check') : m('i.fa.fa-times')),
        m('td.shrink.actions',[
          m('button.btn.btn-sm.btn-default[title=Редактировать]', {onclick: ctrl.startedit.bind(this, data)}, m('i.fa.fa-pencil')),
          m('button.btn.btn-sm.btn-danger[title=Удалить]', {onclick: ctrl.delete.bind(this, data)}, m('i.fa.fa-remove'))
        ])
        ]
        );
  } //showRowTemplate

  //complete view
  return m("#productlist", [
      m("h1", ctrl.title),
      m('div', [
        m('table.table.table-striped.animated.fadeIn', sorts(ctrl.vm.list()), [
          m('thead', 
            m('tr', [
              m('th.shrink.clickable[data-sort-by=id]', '№'),
              m('th.clickable[data-sort-by=image]', 'Фото'),
              m('th.clickable[data-sort-by=name]', 'Название'),
              m('th.clickable[data-sort-by=categoryname]', 'Категория'),
              m('th.shrink.clickable[data-sort-by=ispublished]', 'Опубликована'),
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
              m('button.btn.btn-primary', { onclick: ctrl.startcreate }, [
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./product":14}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./user":16}],18:[function(require,module,exports){
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./user":16}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvY2F0ZWdvcnkvY2F0ZWdvcmllc2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeS5qcyIsImFzc2V0cy9qcy9kYXNoYm9hcmQuanMiLCJhc3NldHMvanMvaGVscGVycy9mdW5jcy5qcyIsImFzc2V0cy9qcy9oZWxwZXJzL21vZGVsLmpzIiwiYXNzZXRzL2pzL2xheW91dC9sYXlvdXQuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3IuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2luYXRvci5qcyIsImFzc2V0cy9qcy9sYXlvdXQvc3Bpbm5lci5qcyIsImFzc2V0cy9qcy9tYWluLmpzIiwiYXNzZXRzL2pzL3BhZ2UvcGFnZS5qcyIsImFzc2V0cy9qcy9wYWdlL3BhZ2Vjb21wb25lbnQuanMiLCJhc3NldHMvanMvcGFnZS9wYWdlc2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9wcm9kdWN0L3Byb2R1Y3QuanMiLCJhc3NldHMvanMvcHJvZHVjdC9wcm9kdWN0c2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy91c2VyL3VzZXIuanMiLCJhc3NldHMvanMvdXNlci91c2VyY29tcG9uZW50LmpzIiwiYXNzZXRzL2pzL3VzZXIvdXNlcnNjb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIGZ1bmNzID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIik7XG52YXIgTW9kZWwgPSByZXF1aXJlKFwiLi4vaGVscGVycy9tb2RlbFwiKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZShcIi4uL2xheW91dC9zcGlubmVyXCIpO1xudmFyIFBhZ2VTaXplU2VsZWN0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3JcIik7XG52YXIgUGFnaW5hdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdpbmF0b3JcIik7XG52YXIgQ2F0ZWdvcnkgPSByZXF1aXJlKCcuL2NhdGVnb3J5Jyk7XG5cblxudmFyIENhdGVnb3JpZXNDb21wb25lbnQgPSB7fTtcbkNhdGVnb3JpZXNDb21wb25lbnQudm0gPSB7fTtcbkNhdGVnb3JpZXNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9jYXRlZ29yaWVzXCIsIHR5cGU6IENhdGVnb3J5fSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cbkNhdGVnb3JpZXNDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBDYXRlZ29yaWVzQ29tcG9uZW50LnZtLmluaXQoKTtcbiAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKTsgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpO30pOyAvL2hpZGUgc3Bpbm5lciBhbmQgcmVkcmF3IGFmdGVyIGRhdGEgYXJyaXZlIFxuICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgtC10LPQvtGA0LjQuCDRgtC+0LLQsNGA0L7QslwiO1xuICBjdHJsLmVkaXRpbmdpZCA9IG0ucHJvcCgnJyk7IC8vaWQgb2YgdGhlIHJvdywgdGhhdCBpcyBiZWluZyBlZGl0ZWRcbiAgY3RybC5yZWNvcmQgPSBtLnByb3AoJycpOyAvL3RlbXBvcmFyeSBzdGF0ZSBvZiB0aGUgcm93LCB0aGF0IGlzIGJlaW5nIGVkaXRlZFxuICBjdHJsLnBhZ2VzaXplID0gbS5wcm9wKGZ1bmNzLmdldENvb2tpZShcInBhZ2VzaXplXCIpIHx8IDEwKTsgLy9udW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2VcbiAgY3RybC5jdXJyZW50cGFnZSA9IG0ucHJvcCgwKTsgLy9jdXJyZW50IHBhZ2UsIHN0YXJ0aW5nIHdpdGggMFxuICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICBjdHJsLnN0YXJ0ZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwuZWRpdGluZ2lkKHJvdy5pZCgpKTtcbiAgICBjdHJsLnJlY29yZCA9IG5ldyBDYXRlZ29yeSh7aWQ6IHJvdy5pZCgpLCBpc1B1Ymxpc2hlZDogcm93LmlzcHVibGlzaGVkKCksIG5hbWU6IHJvdy5uYW1lKCl9KTtcbiAgfVxuICBjdHJsLnVwZGF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLnZtLm1vZGVsLnVwZGF0ZShjdHJsLnJlY29yZClcbiAgICAgIC50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGN0cmwuZWRpdGluZ2lkKCcnKTtcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpW2N0cmwudm0ubGlzdCgpLmluZGV4T2Yocm93KV0gPSBjdHJsLnJlY29yZDsgLy91cGRhdGUgY3VycmVudCByb3cgaW4gZ3JpZFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKX1cbiAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KTtcbiAgfVxuICBjdHJsLnN0YXJ0Y3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgY3RybC5lZGl0aW5naWQoJ25ldycpO1xuICAgIGN0cmwucmVjb3JkID0gbmV3IENhdGVnb3J5KHtpZDogMCwgaXNQdWJsaXNoZWQ6IHRydWUsIG5hbWU6ICcnfSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC5yZWNvcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KCk7XG4gICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGN0cmwuZWRpdGluZ2lkKCcnKTtcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcbiAgICAgICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbiAgY3RybC5kZWxldGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KCk7XG4gICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjdHJsLmN1cnJlbnRwYWdlKCkrMSA+IGZ1bmNzLnBhZ2VzKGN0cmwudm0ubGlzdCgpLmxlbmd0aCwgY3RybC5wYWdlc2l6ZSgpKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY3RybC5jdXJyZW50cGFnZShNYXRoLm1heChjdHJsLmN1cnJlbnRwYWdlKCktMSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgKTtcbiAgfVxuICBjdHJsLmNhbmNlbGVkaXQgPSBmdW5jdGlvbigpeyBjdHJsLmVkaXRpbmdpZCgnJykgfVxufVxuQ2F0ZWdvcmllc0NvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICB2YXIgZWRpdFJvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBbXG4gICAgICBtKCd0cicsIHtcbiAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xuICAgICAgICAgIGlmKCAhaW5pdCApIHtcbiAgICAgICAgICAgIGVsLm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIGN0cmwudXBkYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAyNykgeyBjdHJsLmNhbmNlbGVkaXQoKTsgbS5yZWRyYXcoKTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFtcbiAgICAgIG0oJ3RkLnNocmluaycsIGN0cmwucmVjb3JkLmlkKCkpLFxuICAgICAgbSgndGQnLCBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7XG4gICAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGluaXQpIHtcbiAgICAgICAgICBpZiggIWluaXQgKSBlbC5mb2N1cygpXG4gICAgICAgIH0sXG4gICAgICAgIHZhbHVlOiBjdHJsLnJlY29yZC5uYW1lKCksIFxuICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwucmVjb3JkLm5hbWUpXG4gICAgICB9KSksXG4gICAgICBtKCd0ZC5zaHJpbmsnLFxuICAgICAgICBtKCdpbnB1dFt0eXBlPWNoZWNrYm94XScsIHsgY2hlY2tlZDogY3RybC5yZWNvcmQuaXNwdWJsaXNoZWQoKSwgb25jbGljazogbS53aXRoQXR0cihcImNoZWNrZWRcIiwgY3RybC5yZWNvcmQuaXNwdWJsaXNoZWQpfSlcbiAgICAgICApLFxuICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLCBbXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90KHQvtGF0YDQsNC90LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLnVwZGF0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1jaGVjaycpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QntGC0LzQtdC90LBdJywge29uY2xpY2s6IGN0cmwuY2FuY2VsZWRpdH0sIG0oJ2kuZmEuZmEtdGltZXMnKSlcbiAgICAgIF0pXG4gICAgICBdKSwgLy90clxuICAgICAgY3RybC5lcnJvcigpXG4gICAgICAgID8gbSgndHIuZXJyb3IuYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICAgICAgbSgndGQnKSxcbiAgICAgICAgICAgIG0oJ3RkLnRleHQtZGFuZ2VyW2NvbHNwYW49Ml0nLCBjdHJsLmVycm9yKCkpLFxuICAgICAgICAgICAgbSgndGQnKVxuICAgICAgICBdKVxuICAgICAgICA6IFwiXCJcbiAgICAgICAgXTtcbiAgfSAvL2VkaXRSb3dUZW1wbGF0ZVxuXG4gIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG0oJ3RyLmNsaWNrYWJsZScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgW1xuICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLmlkKCkpLFxuICAgICAgICBtKCd0ZCcsIGRhdGEubmFtZSgpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLnRleHQtY2VudGVyJywgZGF0YS5pc3B1Ymxpc2hlZCgpID8gbSgnaS5mYS5mYS1jaGVjaycpIDogbSgnaS5mYS5mYS10aW1lcycpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLFtcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKVxuICAgICAgICBdKVxuICAgICAgICBdXG4gICAgICAgICk7XG4gIH0gLy9zaG93Um93VGVtcGxhdGVcblxuICB2YXIgY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJ3RyJywge1xuICAgICAgICBjb25maWc6IGZ1bmN0aW9uKGVsLCBpbml0KSB7XG4gICAgICAgICAgaWYoICFpbml0ICkge1xuICAgICAgICAgICAgZWwub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAxMykgY3RybC5jcmVhdGUoKVxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMjcpIHsgY3RybC5jYW5jZWxlZGl0KCk7IG0ucmVkcmF3KCk7IHJldHVybiB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgW1xuICAgICAgbSgndGQuc2hyaW5rJyksXG4gICAgICBtKCd0ZCcsIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHtcbiAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xuICAgICAgICAgIGlmKCAhaW5pdCApIGVsLmZvY3VzKClcbiAgICAgICAgfSxcbiAgICAgICAgdmFsdWU6IGN0cmwucmVjb3JkLm5hbWUoKSwgXG4gICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC5yZWNvcmQubmFtZSlcbiAgICAgIH0pKSxcbiAgICAgIG0oJ3RkLnNocmluaycsXG4gICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywgeyBjaGVja2VkOiBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCgpLCBvbmNsaWNrOiBtLndpdGhBdHRyKFwiY2hlY2tlZFwiLCBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCl9KVxuICAgICAgICksXG4gICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsIFtcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QodC+0LfQtNCw0YLRjF0nLCB7b25jbGljazogY3RybC5jcmVhdGV9LCBtKCdpLmZhLmZhLWNoZWNrJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCe0YLQvNC10L3QsF0nLCB7b25jbGljazogY3RybC5jYW5jZWxlZGl0fSwgbSgnaS5mYS5mYS10aW1lcycpKVxuICAgICAgXSlcbiAgICAgIF1cbiAgICAgICksIC8vdHJcbiAgICAgIGN0cmwuZXJyb3IoKVxuICAgICAgICA/IG0oJ3RyLmVycm9yLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgICAgICAgIG0oJ3RkJyksXG4gICAgICAgICAgICBtKCd0ZC50ZXh0LWRhbmdlcltjb2xzcGFuPTJdJywgY3RybC5lcnJvcigpKSxcbiAgICAgICAgICAgIG0oJ3RkJylcbiAgICAgICAgXSlcbiAgICAgICAgOiBcIlwiXG4gICAgICAgIF07XG4gIH0gLy9jcmVhdGVUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNjYXRlZ29yeWxpc3RcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JywgW1xuICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIHNvcnRzKGN0cmwudm0ubGlzdCgpKSwgW1xuICAgICAgICAgIG0oJ3RoZWFkJywgXG4gICAgICAgICAgICBtKCd0cicsIFtcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aWRdJywgJ+KElicpLFxuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PW5hbWVdJywgJ9Cd0LDQt9Cy0LDQvdC40LUnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aXNwdWJsaXNoZWRdJywgJ9Ce0L/Rg9Cx0LvQuNC60L7QstCw0L3QsCcpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuYWN0aW9ucycsICcjJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICksXG4gICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAvL2lmIHJlY29yZCBsaXN0IGlzIHJlYWR5LCBlbHNlIHNob3cgc3Bpbm5lclxuICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAvL3NsaWNlIGZpbHRlcnMgcmVjb3JkcyBmcm9tIGN1cnJlbnQgcGFnZSBvbmx5XG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLnNsaWNlKGN0cmwuY3VycmVudHBhZ2UoKSpjdHJsLnBhZ2VzaXplKCksIChjdHJsLmN1cnJlbnRwYWdlKCkrMSkqY3RybC5wYWdlc2l6ZSgpKVxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgcmV0dXJuIChjdHJsLmVkaXRpbmdpZCgpID09IGRhdGEuaWQoKSkgPyBlZGl0Um93VGVtcGxhdGUoZGF0YSkgOiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIChjdHJsLmVkaXRpbmdpZCgpID09IFwibmV3XCIpID8gY3JlYXRlVGVtcGxhdGUoKSA6IFwiXCIsXG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKCkgPyBtLmNvbXBvbmVudChTcGlubmVyKSA6IFwiXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcbiAgICAgICAgICAgKSwgLy90Ym9keVxuICAgICAgICAgIF0pLCAvL3RhYmxlXG4gICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnknLCB7IG9uY2xpY2s6IGN0cmwuc3RhcnRjcmVhdGUgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDQutCw0YLQtdCz0L7RgNC40Y4nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhdGVnb3JpZXNDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSl7XG4gIGRhdGEgPSBkYXRhIHx8IHt9O1xuICB0aGlzLmlkID0gbS5wcm9wKGRhdGEuaWQgfHwgMCk7XG4gIHRoaXMubmFtZSA9IG0ucHJvcChkYXRhLm5hbWUgfHwgJycpO1xuICB0aGlzLmlzX3B1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLmlzX3B1Ymxpc2hlZCB8fCBmYWxzZSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBEYXNoYm9hcmRDb21wb25lbnQgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiO1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbiAoY3RybCkge1xuICAgIHJldHVybiBtKFwiaDFcIiwgY3RybC50aXRsZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEYXNoYm9hcmRDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMucGFyc2VFcnJvciA9IGZ1bmN0aW9uKGVycnN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBqb2luRXJyb3JzKEpTT04ucGFyc2UoZXJyc3RyKSk7XG4gIH1cbiAgY2F0Y2goZXJyKSB7XG4gICAgcmV0dXJuIGVycnN0cjtcbiAgfVxufVxuXG52YXIgam9pbkVycm9ycyA9IGZ1bmN0aW9uKGVycm9ycykge1xuICBpZiAodHlwZW9mKGVycm9ycykgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgZXJyc3RyID0gXCJcIjtcbiAgICBmb3IgKGxldCBrZXkgaW4gZXJyb3JzKSB7XG4gICAgICBpZiAodHlwZW9mKGVycm9yc1trZXldKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBmb3IgKGxldCBla2V5IGluIGVycm9yc1trZXldKSB7XG4gICAgICAgICAgZXJyc3RyICs9IGVycm9yc1trZXldW2VrZXldICsgXCIuIFwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlcnJzdHI7XG4gIH0gZWxzZSBcbiAgICByZXR1cm4gZXJyb3JzO1xufVxuXG5cbmV4cG9ydHMucGFnZXMgPSBmdW5jdGlvbihhcmxlbiwgcGFnZXNpemUpIHtcbiAgcmV0dXJuIEFycmF5KE1hdGguZmxvb3IoYXJsZW4vcGFnZXNpemUpICsgKChhcmxlbiVwYWdlc2l6ZSA+IDApID8gMSA6IDApKS5maWxsKDApOyAvL3JldHVybiBlbXB0eSBhcnJheSBvZiBwYWdlc1xufVxuXG5leHBvcnRzLnNvcnRzID0gZnVuY3Rpb24obGlzdCkge1xuICByZXR1cm4ge1xuICAgIG9uY2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBwcm9wID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0LWJ5XCIpO1xuICAgICAgaWYgKHByb3ApIHtcbiAgICAgICAgdmFyIGZpcnN0ID0gbGlzdFswXTtcbiAgICAgICAgbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYVtwcm9wXSgpID4gYltwcm9wXSgpID8gMSA6IGFbcHJvcF0oKSA8IGJbcHJvcF0oKSA/IC0xIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChmaXJzdCA9PT0gbGlzdFswXSkgbGlzdC5yZXZlcnNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydHMubXJlcXVlc3QgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBub25Kc29uRXJyb3JzID0gZnVuY3Rpb24oeGhyKSB7XG4gICAgcmV0dXJuICh4aHIuc3RhdHVzID4gMjA0ICYmIHhoci5yZXNwb25zZVRleHQubGVuZ3RoKSBcbiAgICAgID8gSlNPTi5zdHJpbmdpZnkoeGhyLnJlc3BvbnNlVGV4dCkgXG4gICAgICA6ICh4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aClcbiAgICAgID8geGhyLnJlc3BvbnNlVGV4dFxuICAgICAgOiBudWxsO1xuICB9XG4gIGFyZ3MuZXh0cmFjdCA9IG5vbkpzb25FcnJvcnM7XG4gIHJldHVybiBtLnJlcXVlc3QoYXJncyk7XG59XG5cbmV4cG9ydHMuc2V0Q29va2llID0gZnVuY3Rpb24oY25hbWUsIGN2YWx1ZSwgZXhkYXlzKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKGV4ZGF5cyoyNCo2MCo2MCoxMDAwKSk7XG4gIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiKyBkLnRvVVRDU3RyaW5nKCk7XG4gIGRvY3VtZW50LmNvb2tpZSA9IGNuYW1lICsgXCI9XCIgKyBjdmFsdWUgKyBcIjtcIiArIGV4cGlyZXMgKyBcIjtwYXRoPS9cIjtcbn1cblxuZXhwb3J0cy5nZXRDb29raWUgPSBmdW5jdGlvbihjbmFtZSkge1xuICB2YXIgbmFtZSA9IGNuYW1lICsgXCI9XCI7XG4gIHZhciBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICBmb3IodmFyIGkgPSAwOyBpIDxjYS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjID0gY2FbaV07XG4gICAgd2hpbGUgKGMuY2hhckF0KDApPT0nICcpIHtcbiAgICAgIGMgPSBjLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZS5sZW5ndGgsYy5sZW5ndGgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gXCJcIjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1yZXF1ZXN0ID0gcmVxdWlyZShcIi4vZnVuY3NcIikubXJlcXVlc3Q7XG5cbi8vYXJnczoge3VybDogXCIvYXBpL2V4YW1wbGVcIiwgdHlwZTogT2JqZWN0VHlwZX1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIG1vZGVsID0gdGhpcztcblxuICBtb2RlbC5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBtcmVxdWVzdCh7XG4gICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgbWV0aG9kOiBcIkdFVFwiLCBcbiAgICAgIHVybDogYXJncy51cmwsIFxuICAgICAgdHlwZTogYXJncy50eXBlXG4gICAgfSlcbiAgfTtcbiAgbW9kZWwuZ2V0ID0gZnVuY3Rpb24oaWQpIHtcbiAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJHRVRcIiwgXG4gICAgICB1cmw6IGFyZ3MudXJsICsgXCIvXCIgKyBpZCxcbiAgICAgIHR5cGU6IGFyZ3MudHlwZVxuICAgIH0pXG4gIH07XG4gIG1vZGVsLmNyZWF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbXJlcXVlc3QgKHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgdXJsOiBhcmdzLnVybCxcbiAgICAgIGRhdGE6IGRhdGEsXG4gICAgfSlcbiAgfTtcbiAgbW9kZWwudXBkYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtcmVxdWVzdCh7XG4gICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgbWV0aG9kOiBcIlBVVFwiLFxuICAgICAgdXJsOiBhcmdzLnVybCArIFwiL1wiICsgZGF0YSgpLmlkKCksXG4gICAgICBkYXRhOiBkYXRhLFxuICAgIH0pXG4gIH07XG4gIG1vZGVsLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0KHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgICB1cmw6IGFyZ3MudXJsICsgXCIvXCIgKyBpZCxcbiAgICB9KVxuICB9O1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGxheW91dChjb21wb25lbnQpIHtcbiAgZnVuY3Rpb24gbG9nb3V0KCkge1xuICAgIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLCBcbiAgICAgIHVybDogXCIvYXBpL2xvZ291dFwiLCBcbiAgICB9KS50aGVuKChzdWNjZXNzKSA9PiB7d2luZG93LmxvY2F0aW9uID0gXCIvXCI7fSlcbiAgfVxuXG4gIHZhciBoZWFkZXIgPSBtKFwibmF2Lm5hdmJhci5uYXZiYXItZGVmYXVsdFwiLCBbXG4gICAgICBtKCcubmF2YmFyLWhlYWRlcicsIFtcbiAgICAgICAgbSgnYnV0dG9uLm5hdmJhci10b2dnbGUuY29sbGFwc2VkW3R5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCIgZGF0YS10YXJnZXQ9XCIjbmF2YmFyLWNvbGxhcHNlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCJdJywgW1xuICAgICAgICAgIG0oJ3NwYW4uc3Itb25seScsIFwiVG9nZ2xlIG5hdmlnYXRpb25cIiksXG4gICAgICAgICAgbSgnc3Bhbi5pY29uLWJhcicpLFxuICAgICAgICAgIG0oJ3NwYW4uaWNvbi1iYXInKSxcbiAgICAgICAgICBtKCdzcGFuLmljb24tYmFyJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2EubmF2YmFyLWJyYW5kW2hyZWY9XCIjXCJdJywgXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiKVxuICAgICAgXSksXG4gICAgICBtKCcuY29sbGFwc2UgbmF2YmFyLWNvbGxhcHNlI25hdmJhci1jb2xsYXBzZScsIFtcbiAgICAgICAgbSgndWwubmF2Lm5hdmJhci1uYXYubmF2YmFyLXJpZ2h0JywgW1xuICAgICAgICAgIG0oJ2xpJywgXG4gICAgICAgICAgICBtKCdhW2hyZWY9XCIvXCJdJywgW1xuICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsYXknKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsIFwi0KHQsNC50YJcIilcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICksXG4gICAgICAgICAgbSgnbGknLCBcbiAgICAgICAgICAgIG0oJ2FbaHJlZj1cIiNcIl0nLCB7b25jbGljazogbG9nb3V0fSwgW1xuICAgICAgICAgICAgICBtKCdpLmZhLmZhLXNpZ24tb3V0JyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCBcItCS0YvQudGC0LhcIilcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgICAgIF0pO1xuXG4gIHZhciBuYXZsaW5rID0gZnVuY3Rpb24gKHVybCwgdGl0bGUpIHtcbiAgICByZXR1cm4gbSgnbGknLCB7IGNsYXNzOiAobS5yb3V0ZSgpLmluY2x1ZGVzKHVybCkpID8gXCJhY3RpdmVcIiA6IFwiXCIgfSwgbSgnYScsIHsgaHJlZjogdXJsLCBjb25maWc6IG0ucm91dGUgfSwgdGl0bGUpKTtcbiAgfVxuICB2YXIgc2lkZWJhciA9IFtcbiAgICBtKCcucGFuZWwucGFuZWwtZGVmYXVsdCcsIFtcbiAgICAgICAgbSgndWwubmF2IG5hdi1waWxscyBuYXYtc3RhY2tlZCcsIFtcbiAgICAgICAgICBuYXZsaW5rKFwiL2NhdGVnb3JpZXNcIiwgXCLQmtCw0YLQtdCz0L7RgNC40Lgg0YLQvtCy0LDRgNC+0LJcIiksXG4gICAgICAgICAgbmF2bGluayhcIi9wcm9kdWN0c1wiLCBcItCi0L7QstCw0YDRi1wiKSxcbiAgICAgICAgICBuYXZsaW5rKFwiL3BhZ2VzXCIsIFwi0KHRgtGA0LDQvdC40YbRi1wiKSxcbiAgICAgICAgICBuYXZsaW5rKFwiL3VzZXJzXCIsIFwi0J/QvtC70YzQt9C+0LLQsNGC0LXQu9C4XCIpLFxuICAgICAgICBdKVxuICAgIF0pXG4gIF07XG5cbiAgcmV0dXJuIFtcbiAgICBoZWFkZXIsXG4gICAgbShcIiNjb250ZW50LXdyYXBwZXJcIiwgW1xuICAgICAgICBtKCcjc2lkZWJhcicsIHNpZGViYXIpLFxuICAgICAgICBtKCcjY29udGVudCcsIG0uY29tcG9uZW50KGNvbXBvbmVudCkpXG4gICAgXSksXG4gIF07XG59O1xuXG5mdW5jdGlvbiBtaXhpbkxheW91dChsYXlvdXQsIGNvbXBvbmVudCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBsYXlvdXQoY29tcG9uZW50KTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICByZXR1cm4geyBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7IH0sIHZpZXc6IG1peGluTGF5b3V0KGxheW91dCwgY29tcG9uZW50KSB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzZXRDb29raWUgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKS5zZXRDb29raWU7XG5cbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0ge307XG5cbi8vYXJnIGlzIGFuIG0ucHJvcCBvZiBwYWdlc2l6ZSBpbiB0aGUgcGFyZW50IGNvbnRyb2xsZXJcblBhZ2VTaXplU2VsZWN0b3IuY29udHJvbGxlciA9IGZ1bmN0aW9uKGFyZykge1xuICB2YXIgY3RybCA9IHRoaXM7XG4gIGN0cmwuc2V0cGFnZXNpemUgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgYXJnKHNpemUpO1xuICAgIHNldENvb2tpZShcInBhZ2VzaXplXCIsIHNpemUsIDM2NSk7IC8vc3RvcmUgcGFnZXNpemUgaW4gY29va2llc1xuICAgIG0ucmVkcmF3KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuXG5QYWdlU2l6ZVNlbGVjdG9yLnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmcpIHtcbiAgcmV0dXJuIG0oJyNwYWdlc2l6ZXNlbGVjdG9yJywgW1xuICAgICAgbSgnc3BhbicsIFwi0J/QvtC60LDQt9GL0LLQsNGC0Ywg0L3QsCDRgdGC0YDQsNC90LjRhtC1OiBcIiksXG4gICAgICBbMTAsIDUwLCAxMDAsIDUwMF0ubWFwKGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgcmV0dXJuIG0oJ2FbaHJlZj0jXScsIHtjbGFzczogKHNpemUgPT0gYXJnKCkpID8gJ2FjdGl2ZScgOiAnJywgb25jbGljazogY3RybC5zZXRwYWdlc2l6ZS5iaW5kKHRoaXMsIHNpemUpfSwgc2l6ZSlcbiAgICAgIH0pXG4gIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2VTaXplU2VsZWN0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYWdlcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvZnVuY3MnKS5wYWdlcztcbnZhciBQYWdpbmF0b3IgPSB7fTtcblxuUGFnaW5hdG9yLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjdHJsID0gdGhpcztcbiAgY3RybC5zZXRwYWdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBhcmdzLm9uc2V0cGFnZShpbmRleCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cblBhZ2luYXRvci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICByZXR1cm4gbSgnI3BhZ2luYXRvcicsIFxuICAgICAgKGFyZ3MubGlzdCgpLmxlbmd0aCA+IGFyZ3MucGFnZXNpemUoKSlcbiAgICAgID8gbSgnbmF2JywgW1xuICAgICAgICBtKCd1bC5wYWdpbmF0aW9uJywgXG4gICAgICAgICAgcGFnZXMoYXJncy5saXN0KCkubGVuZ3RoLCBhcmdzLnBhZ2VzaXplKCkpXG4gICAgICAgICAgLm1hcChmdW5jdGlvbihwLCBpbmRleCl7XG4gICAgICAgICAgICByZXR1cm4gbSgnbGknLCB7Y2xhc3M6IChpbmRleCA9PSBhcmdzLmN1cnJlbnRwYWdlKCkpID8gJ2FjdGl2ZScgOiAnJ30sIFxuICAgICAgICAgICAgICAgIChpbmRleCA9PSBhcmdzLmN1cnJlbnRwYWdlKCkpXG4gICAgICAgICAgICAgICAgPyBtKCdzcGFuJywgaW5kZXgrMSlcbiAgICAgICAgICAgICAgICA6IG0oJ2FbaHJlZj0vXScsIHtvbmNsaWNrOiBjdHJsLnNldHBhZ2UuYmluZCh0aGlzLCBpbmRleCl9LCBpbmRleCsxKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICAgKVxuICAgICAgXSlcbiAgICAgIDogXCJcIlxuICAgICAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdpbmF0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBMb2FkaW5nU3Bpbm5lciA9IHt9O1xuXG5Mb2FkaW5nU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oKSB7fVxuTG9hZGluZ1NwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgcmV0dXJuIG0oJyNsb2FkaW5nLXNwaW5uZXIuYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgbSgncC50ZXh0LWNlbnRlcicsIG0oJ2kuZmEuZmEtc3Bpbi5mYS1jb2cuZmEtM3gnKSksXG4gICAgICBtKCdwLnRleHQtY2VudGVyJywgJ9Cf0L7QtNC+0LbQtNC40YLQtSwg0LjQtNC10YIg0LfQsNCz0YDRg9C30LrQsC4uLicpXG4gIF0pO1xufVxuXG52YXIgVXBkYXRpbmdTcGlubmVyID0ge307XG5cblVwZGF0aW5nU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge31cblVwZGF0aW5nU3Bpbm5lci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICByZXR1cm4gbSgnI3VwZGF0aW5nLXNwaW5uZXIuYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgbSgncCNzcGlubmVyLXRleHQnLCBtKCdpLmZhLmZhLXNwaW4uZmEtY29nLmZhLTN4JykpLFxuICBdKTtcbn1cblxudmFyIFNwaW5uZXIgPSB7fTtcblNwaW5uZXIuY29udHJvbGxlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBjdHJsLnN0YW5kYWxvbmUgPSAoYXJncyAmJiBhcmdzLnN0YW5kYWxvbmUpID8gdHJ1ZSA6IGZhbHNlO1xufVxuU3Bpbm5lci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICByZXR1cm4gbSgnI3NwaW5uZXInLCBcbiAgICAgIChjdHJsLnN0YW5kYWxvbmUpIFxuICAgICAgPyBtLmNvbXBvbmVudChMb2FkaW5nU3Bpbm5lcikgXG4gICAgICA6IG0uY29tcG9uZW50KFVwZGF0aW5nU3Bpbm5lcilcbiAgICAgIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGlubmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgRGFzaGJvYXJkQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vZGFzaGJvYXJkXCIpO1xudmFyIENhdGVnb3JpZXNDb21wb25lbnQgPSByZXF1aXJlKFwiLi9jYXRlZ29yeS9jYXRlZ29yaWVzY29tcG9uZW50XCIpO1xudmFyIFByb2R1Y3RzQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vcHJvZHVjdC9wcm9kdWN0c2NvbXBvbmVudFwiKTtcbnZhciBQcm9kdWN0Q29tcG9uZW50ID0gcmVxdWlyZShcIi4vcHJvZHVjdC9wcm9kdWN0XCIpO1xudmFyIFVzZXJzQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vdXNlci91c2Vyc2NvbXBvbmVudFwiKTtcbnZhciBVc2VyQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vdXNlci91c2VyY29tcG9uZW50XCIpO1xudmFyIFBhZ2VzQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vcGFnZS9wYWdlc2NvbXBvbmVudFwiKTtcbnZhciBQYWdlQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vcGFnZS9wYWdlY29tcG9uZW50XCIpO1xudmFyIGxheW91dCA9IHJlcXVpcmUoXCIuL2xheW91dC9sYXlvdXRcIik7XG5cbi8vc2V0dXAgcm91dGVzIHRvIHN0YXJ0IHcvIHRoZSBgI2Agc3ltYm9sXG5tLnJvdXRlLm1vZGUgPSBcImhhc2hcIjtcblxubS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkbWluLWFwcFwiKSwgXCIvXCIsIHtcbiAgXCIvXCI6IGxheW91dChEYXNoYm9hcmRDb21wb25lbnQpLFxuICBcIi91c2Vyc1wiOiBsYXlvdXQoVXNlcnNDb21wb25lbnQpLFxuICBcIi91c2Vycy86aWRcIjogbGF5b3V0KFVzZXJDb21wb25lbnQpLFxuICBcIi9wYWdlc1wiOiBsYXlvdXQoUGFnZXNDb21wb25lbnQpLFxuICBcIi9wYWdlcy86aWRcIjogbGF5b3V0KFBhZ2VDb21wb25lbnQpLFxuICBcIi9jYXRlZ29yaWVzXCI6IGxheW91dChDYXRlZ29yaWVzQ29tcG9uZW50KSxcbiAgXCIvcHJvZHVjdHNcIjogbGF5b3V0KFByb2R1Y3RzQ29tcG9uZW50KSxcbiAgXCIvcHJvZHVjdHMvOmlkXCI6IGxheW91dChQcm9kdWN0Q29tcG9uZW50KSxcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSl7XG4gIGRhdGEgPSBkYXRhIHx8IHt9O1xuICB0aGlzLmlkID0gbS5wcm9wKGRhdGEuaWQgfHwgMCk7XG4gIHRoaXMubmFtZSA9IG0ucHJvcChkYXRhLm5hbWUgfHwgJycpO1xuICB0aGlzLnNsdWcgPSBtLnByb3AoZGF0YS5zbHVnIHx8ICcnKTtcbiAgdGhpcy5jb250ZW50ID0gbS5wcm9wKGRhdGEuY29udGVudCB8fCAnJyk7XG4gIHRoaXMucHVibGlzaGVkID0gbS5wcm9wKGRhdGEucHVibGlzaGVkIHx8IHRydWUpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvbW9kZWwnKTtcbnZhciBTcGlubmVyID0gcmVxdWlyZSgnLi4vbGF5b3V0L3NwaW5uZXInKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3InKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKCcuLi9sYXlvdXQvcGFnaW5hdG9yJyk7XG52YXIgUGFnZSA9IHJlcXVpcmUoJy4vcGFnZScpO1xuXG5cbnZhciBQYWdlQ29tcG9uZW50ID0ge307XG5QYWdlQ29tcG9uZW50LnZtID0ge307XG5QYWdlQ29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3BhZ2VzXCIsIHR5cGU6IFBhZ2V9KTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgdm0ucmVjb3JkID0gbS5wcm9wKG5ldyBQYWdlKCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblBhZ2VDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBQYWdlQ29tcG9uZW50LnZtLmluaXQoKTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcChmYWxzZSk7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC+0LfQtNCw0L3QuNC1INGB0YLRgNCw0L3QuNGG0YtcIjtcbiAgfSBlbHNlIHtcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgICBjdHJsLnZtLnJlY29yZC50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpO30pOyAvL2hpZGUgc3Bpbm5lciBhbmQgcmVkcmF3IGFmdGVyIGRhdGEgYXJyaXZlIFxuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0JrQsNGA0YLQvtGH0LrQsCDRgdGC0YDQsNC90LjRhtGLXCI7XG4gIH1cbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG4gIGN0cmwubWVzc2FnZSA9IG0ucHJvcCgnJyk7IC8vbm90aWZpY2F0aW9uc1xuXG4gIGN0cmwuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgbS5yb3V0ZShcIi9wYWdlc1wiKTtcbiAgfVxuICBjdHJsLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC51cGRhdGUoY3RybC52bS5yZWNvcmQpXG4gICAgICAudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7Y3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyk7fSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvcikge2N0cmwuZXJyb3IoZnVuY3MucGFyc2VFcnJvcihlcnJvcikpO31cbiAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KTtcbiAgfVxuICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwubWVzc2FnZSgnJyk7XG4gICAgY3RybC5lcnJvcignJyk7XG4gICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC52bS5yZWNvcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHttLnJvdXRlKFwiL3BhZ2VzXCIpO30sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC5lcnJvcihmdW5jcy5wYXJzZUVycm9yKGVycm9yKSk7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7IFxuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgKTtcbiAgfVxufVxuUGFnZUNvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjcGFnZWNvbXBvbmVudFwiLCBbXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBjdHJsLnZtLnJlY29yZCgpXG4gICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQl9Cw0LPQvtC70L7QstC+0LonKSxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7dmFsdWU6IGN0cmwudm0ucmVjb3JkKCkubmFtZSgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkubmFtZSl9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0JrQvtGA0L7RgtC60LjQuSDQsNC00YDQtdGBJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLnNsdWcoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLnNsdWcpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ch0L7QtNC10YDQttCw0L3QuNC1JyksXG4gICAgICAgICAgbSgndGV4dGFyZWEuZm9ybS1jb250cm9sJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmNvbnRlbnQoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLmNvbnRlbnQpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ce0L/Rg9Cx0LvQuNC60L7QstCw0YLRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywge2NoZWNrZWQ6IGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKCksIG9uY2xpY2s6IG0ud2l0aEF0dHIoXCJjaGVja2VkXCIsIGN0cmwudm0ucmVjb3JkKCkucHVibGlzaGVkKX0pXG4gICAgICAgIF0pLFxuICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgKGN0cmwuZXJyb3IoKSkgPyBtKCcuYWN0aW9uLWFsZXJ0LmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5lcnJvcigpKSA6IFwiXCIsXG4gICAgICAgIG0oJy5hY3Rpb25zJywgW1xuICAgICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIilcbiAgICAgICAgICA/IG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC5jcmVhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xuICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0LfQtNCw0YLRjCcpXG4gICAgICAgICAgXSlcbiAgICAgICAgICA6IFtcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5W3R5cGU9XCJzdWJtaXRcIl0nLCB7IG9uY2xpY2s6IGN0cmwudXBkYXRlLCBkaXNhYmxlZDogY3RybC51cGRhdGluZygpIH0sIFtcbiAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXdhcm5pbmcnLCB7IG9uY2xpY2s6IGN0cmwuY2FuY2VsIH0sIFtcbiAgICAgICAgICAgIG0oJ2kuZmEuZmEtY2hldnJvbi1sZWZ0JyksXG4gICAgICAgICAgICBtKCdzcGFuJywgJ9Ce0YLQvNC10L3QsCcpXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcbiAgICBdKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2VDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIFBhZ2UgPSByZXF1aXJlKFwiLi9wYWdlXCIpO1xuXG52YXIgUGFnZXNDb21wb25lbnQgPSB7fTtcblBhZ2VzQ29tcG9uZW50LnZtID0ge307XG5QYWdlc0NvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3BhZ2VzXCIsIHR5cGU6IFBhZ2V9KTtcbiAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KCk7XG4gIHJldHVybiB0aGlzO1xufVxuUGFnZXNDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBQYWdlc0NvbXBvbmVudC52bS5pbml0KCk7XG4gIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC/0LjRgdC+0Log0YHRgtGA0LDQvdC40YZcIjtcbiAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChmdW5jcy5nZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCk7IC8vbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlXG4gIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCk7IC8vY3VycmVudCBwYWdlLCBzdGFydGluZyB3aXRoIDBcbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5lZGl0ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi9wYWdlcy9cIityb3cuaWQoKSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL3BhZ2VzL25ld1wiKTtcbiAgfVxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKTtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gZnVuY3MucGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbn1cblBhZ2VzQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG0oJ3RyLmNsaWNrYWJsZScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXG4gICAgICAgIFtcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuc2x1ZygpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rJywgZGF0YS5wdWJsaXNoZWQoKSA/IG0oJ2kuZmEuZmEtY2hlY2snKSA6IG0oJ2kuZmEuZmEtdGltZXMnKSksXG4gICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJyxbXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90KDQtdC00LDQutGC0LjRgNC+0LLQsNGC0YxdJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRhbmdlclt0aXRsZT3Qo9C00LDQu9C40YLRjF0nLCB7b25jbGljazogY3RybC5kZWxldGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcmVtb3ZlJykpXG4gICAgICAgIF0pXG4gICAgICAgIF1cbiAgICAgICAgKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNwYWdlc2NvbXBvbmVudFwiLCBbXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBtKCdkaXYnLCBbXG4gICAgICAgIG0oJ3RhYmxlLnRhYmxlLnRhYmxlLXN0cmlwZWQuYW5pbWF0ZWQuZmFkZUluJywgZnVuY3Muc29ydHMoY3RybC52bS5saXN0KCkpLCBbXG4gICAgICAgICAgbSgndGhlYWQnLCBcbiAgICAgICAgICAgIG0oJ3RyJywgW1xuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PW5hbWVdJywgJ9CX0LDQs9C+0LvQvtCy0L7QuicpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1zbHVnXScsICfQmtC+0YAuINCw0LTRgNC10YEnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9cHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90L4nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyKVxuICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5jcmVhdGUgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDRgdGC0YDQsNC90LjRhtGDJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgY3RybC52bS5saXN0KCkgPyBtLmNvbXBvbmVudChQYWdpbmF0b3IsIHtsaXN0OiBjdHJsLnZtLmxpc3QsIHBhZ2VzaXplOiBjdHJsLnBhZ2VzaXplLCBjdXJyZW50cGFnZTogY3RybC5jdXJyZW50cGFnZSwgb25zZXRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlfSkgOiBcIlwiLFxuICAgICAgICAgIF0pXG4gICAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlc0NvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKXtcbiAgZGF0YSA9IGRhdGEgfHwge307XG4gIHRoaXMuaWQgPSBtLnByb3AoZGF0YS5pZCB8fCAwKTtcbiAgdGhpcy5uYW1lID0gbS5wcm9wKGRhdGEubmFtZSB8fCAnJyk7XG4gIHRoaXMuaXNwdWJsaXNoZWQgPSBtLnByb3AoZGF0YS5pc1B1Ymxpc2hlZCB8fCBmYWxzZSk7XG4gIHRoaXMuY2F0ZWdvcnluYW1lID0gbS5wcm9wKGRhdGEuY2F0ZWdvcnlOYW1lIHx8ICcnKTtcbiAgdGhpcy5jYXRlZ29yeWlkID0gbS5wcm9wKGRhdGEuY2F0ZWdvcnlJZCB8fCAwKTtcbiAgdGhpcy5kZXNjcmlwdGlvbiA9IG0ucHJvcChkYXRhLmRlc2NyaXB0aW9uIHx8ICcnKTtcbiAgdGhpcy5pbWFnZSA9IG0ucHJvcChkYXRhLmltYWdlIHx8ICcnKTtcbiAgdGhpcy5wcmljZSA9IG0ucHJvcChkYXRhLnByaWNlIHx8IG51bGwpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBQcm9kdWN0ID0gcmVxdWlyZShcIi4vcHJvZHVjdFwiKTtcblxudmFyIFByb2R1Y3RzQ29tcG9uZW50ID0ge307XG5Qcm9kdWN0c0NvbXBvbmVudC52bSA9IHt9O1xuUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wcm9kdWN0c1wiLCB0eXBlOiBQcm9kdWN0fSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cblByb2R1Y3RzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuc3RhcnRlZGl0ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgY29uc29sZS5sb2coJ1VzZSBtLnJvdXRlIHRvIHJlZGlyZWN0Jyk7XG4gIH1cbiAgY3RybC5zdGFydGNyZWF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvcHJvZHVjdHMvbmV3XCIpO1xuICB9XG4gIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy9wcmV2ZW50IHRyLm9uY2xpY2sgdHJpZ2dlclxuICAgIGN0cmwudm0ubW9kZWwuZGVsZXRlKHJvdy5pZCgpKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpO1xuICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY3RybC5jdXJyZW50cGFnZSgpKzEgPiBmdW5jcy5wYWdlcyhjdHJsLnZtLmxpc3QoKS5sZW5ndGgsIGN0cmwucGFnZXNpemUoKSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGN0cmwuY3VycmVudHBhZ2UoTWF0aC5tYXgoY3RybC5jdXJyZW50cGFnZSgpLTEsIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbn1cblByb2R1Y3RzQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG0oJ3RyLmNsaWNrYWJsZScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgW1xuICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLmlkKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsnLCAoZGF0YS5pbWFnZSgpKSA/IG0oJ2ltZy5pbWFnZS1wcmV2aWV3LmltZy1yZXNwb25zaXZlJywge3NyYzogZGF0YS5pbWFnZSgpfSkgOiBcIlwiKSxcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuY2F0ZWdvcnluYW1lKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsudGV4dC1jZW50ZXInLCBkYXRhLmlzcHVibGlzaGVkKCkgPyBtKCdpLmZhLmZhLWNoZWNrJykgOiBtKCdpLmZhLmZhLXRpbWVzJykpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRhbmdlclt0aXRsZT3Qo9C00LDQu9C40YLRjF0nLCB7b25jbGljazogY3RybC5kZWxldGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcmVtb3ZlJykpXG4gICAgICAgIF0pXG4gICAgICAgIF1cbiAgICAgICAgKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNwcm9kdWN0bGlzdFwiLCBbXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBtKCdkaXYnLCBbXG4gICAgICAgIG0oJ3RhYmxlLnRhYmxlLnRhYmxlLXN0cmlwZWQuYW5pbWF0ZWQuZmFkZUluJywgc29ydHMoY3RybC52bS5saXN0KCkpLCBbXG4gICAgICAgICAgbSgndGhlYWQnLCBcbiAgICAgICAgICAgIG0oJ3RyJywgW1xuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1pZF0nLCAn4oSWJyksXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aW1hZ2VdJywgJ9Ck0L7RgtC+JyksXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9bmFtZV0nLCAn0J3QsNC30LLQsNC90LjQtScpLFxuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWNhdGVnb3J5bmFtZV0nLCAn0JrQsNGC0LXQs9C+0YDQuNGPJyksXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlzcHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyKVxuICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5zdGFydGNyZWF0ZSB9LCBbXG4gICAgICAgICAgICAgICAgbSgnaS5mYS5mYS1wbHVzJyksXG4gICAgICAgICAgICAgICAgbSgnc3BhbicsICfQlNC+0LHQsNCy0LjRgtGMINGC0L7QstCw0YAnKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2R1Y3RzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5lbWFpbCA9IG0ucHJvcChkYXRhLmVtYWlsIHx8ICcnKTtcbiAgdGhpcy5jdXJyZW50X3Bhc3N3b3JkID0gbS5wcm9wKGRhdGEuY3VycmVudF9wYXNzd29yZCB8fCAnJyk7XG4gIHRoaXMucGFzc3dvcmQgPSBtLnByb3AoZGF0YS5wYXNzd29yZCB8fCAnJyk7XG4gIHRoaXMucGFzc3dvcmRfY29uZmlybSA9IG0ucHJvcChkYXRhLnBhc3N3b3JkX2NvbmZpcm0gfHwgJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi91c2VyJyk7XG5cbnZhciBVc2VyQ29tcG9uZW50ID0ge307XG5Vc2VyQ29tcG9uZW50LnZtID0ge307XG5Vc2VyQ29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3VzZXJzXCIsIHR5cGU6IFVzZXJ9KTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgdm0ucmVjb3JkID0gbS5wcm9wKG5ldyBVc2VyKCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblVzZXJDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBVc2VyQ29tcG9uZW50LnZtLmluaXQoKTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcChmYWxzZSk7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC+0LfQtNCw0L3QuNC1INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiO1xuICB9IGVsc2Uge1xuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICAgIGN0cmwudm0ucmVjb3JkLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YDRgtC+0YfQutCwINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiO1xuICB9XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpOyAvL25vdGlmaWNhdGlvbnNcblxuICBjdHJsLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIG0ucm91dGUoXCIvdXNlcnNcIik7XG4gIH1cbiAgY3RybC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwudm0ucmVjb3JkKVxuICAgICAgLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge2N0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO30sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTt9XG4gICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpfSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwuY3JlYXRlKGN0cmwudm0ucmVjb3JkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7IG0ucm91dGUoXCIvdXNlcnNcIik7fSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLmVycm9yKGZ1bmNzLnBhcnNlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG59XG5Vc2VyQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiN1c2VyXCIsIFtcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIGN0cmwudm0ucmVjb3JkKClcbiAgICAgID8gbSgnZm9ybS5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9CY0LzRjycpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5uYW1lKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5uYW1lKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQrdC7LiDQv9C+0YfRgtCwJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9ZW1haWxdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmVtYWlsKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5lbWFpbCl9KVxuICAgICAgICBdKSxcbiAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSAhPSBcIm5ld1wiKVxuICAgICAgICA/IG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ci0LXQutGD0YnQuNC5INC/0LDRgNC+0LvRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbFt0eXBlPXBhc3N3b3JkXScsIHtwbGFjZWhvbGRlcjogXCLQntGB0YLQsNCy0YzRgtC1INC/0YPRgdGC0YvQvCwg0YfRgtC+0LHRiyDRgdC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40Lkg0L/QsNGA0L7Qu9GMXCIsIHZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmN1cnJlbnRfcGFzc3dvcmQoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLmN1cnJlbnRfcGFzc3dvcmQpfSlcbiAgICAgICAgXSlcbiAgICAgICAgOiBcIlwiLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQndC+0LLRi9C5INC/0LDRgNC+0LvRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbFt0eXBlPXBhc3N3b3JkXScsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5wYXNzd29yZCgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkucGFzc3dvcmQpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Cf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1INC/0LDRgNC+0LvRjycpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbFt0eXBlPXBhc3N3b3JkXScsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5wYXNzd29yZF9jb25maXJtKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5wYXNzd29yZF9jb25maXJtKX0pXG4gICAgICAgIF0pLFxuICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgKGN0cmwuZXJyb3IoKSkgPyBtKCcuYWN0aW9uLWFsZXJ0LmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5lcnJvcigpKSA6IFwiXCIsXG4gICAgICAgIG0oJy5hY3Rpb25zJywgW1xuICAgICAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKVxuICAgICAgICAgICAgPyBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5W3R5cGU9XCJzdWJtaXRcIl0nLCB7IG9uY2xpY2s6IGN0cmwuY3JlYXRlLCBkaXNhYmxlZDogY3RybC51cGRhdGluZygpIH0sIFtcbiAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7Qt9C00LDRgtGMJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICA6IFtcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC51cGRhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xuICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXdhcm5pbmcnLCB7IG9uY2xpY2s6IGN0cmwuY2FuY2VsIH0sIFtcbiAgICAgICAgICAgICAgbSgnaS5mYS5mYS1jaGV2cm9uLWxlZnQnKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsICfQntGC0LzQtdC90LAnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lciwge3N0YW5kYWxvbmU6IHRydWV9KVxuICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIFVzZXIgPSByZXF1aXJlKFwiLi91c2VyXCIpO1xuXG52YXIgVXNlcnNDb21wb25lbnQgPSB7fTtcblVzZXJzQ29tcG9uZW50LnZtID0ge307XG5Vc2Vyc0NvbXBvbmVudC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICBhcmdzID0gYXJncyB8fCB7fTtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3VzZXJzXCIsIHR5cGU6IFVzZXJ9KTtcbiAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KCk7XG4gIHJldHVybiB0aGlzO1xufVxuVXNlcnNDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBVc2Vyc0NvbXBvbmVudC52bS5pbml0KCk7XG4gIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC/0LjRgdC+0Log0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10LlcIjtcbiAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChmdW5jcy5nZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCk7IC8vbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlXG4gIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCk7IC8vY3VycmVudCBwYWdlLCBzdGFydGluZyB3aXRoIDBcbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5lZGl0ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi91c2Vycy9cIityb3cuaWQoKSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBtLnJvdXRlKFwiL3VzZXJzL25ld1wiKTtcbiAgfVxuICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKTtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gZnVuY3MucGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG59XG5Vc2Vyc0NvbXBvbmVudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LFxuICAgICAgICBbXG4gICAgICAgIG0oJ3RkJywgZGF0YS5lbWFpbCgpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rJywgZGF0YS5uYW1lKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKVxuICAgICAgICBdKVxuICAgICAgICBdXG4gICAgICAgICk7XG4gIH0gLy9zaG93Um93VGVtcGxhdGVcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjdXNlcmxpc3RcIiwgW1xuICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgbSgnZGl2JywgW1xuICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIGZ1bmNzLnNvcnRzKGN0cmwudm0ubGlzdCgpKSwgW1xuICAgICAgICAgIG0oJ3RoZWFkJywgXG4gICAgICAgICAgICBtKCd0cicsIFtcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1lbWFpbF0nLCAn0K3Quy4g0L/QvtGH0YLQsCcpLFxuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQmNC80Y8nKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyKVxuICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5jcmVhdGUgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0JTQvtCx0LDQstC40YLRjCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJzQ29tcG9uZW50O1xuIl19
