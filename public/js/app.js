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
          function(error) {ctrl.error(parseError(error))}
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
          ctrl.error(parseError(error));
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
  this.id = m.prop(data.ID || 0);
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
          navlink("/users", "Пользователи"),
        ])
    ])
  ];

  var footer = [
  m('footer#footer', [
      m('div', "Подвал сайта")
  ])
  ];
  return [
  header,
  m("#content-wrapper", [
      m('#sidebar', sidebar),
      m('#content', m.component(component))
  ]),
  footer
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
var layout = require("./layout/layout");

//setup routes to start w/ the `#` symbol
m.route.mode = "hash";

m.route(document.getElementById("admin-app"), "/", {
  "/": layout(DashboardComponent),
  "/users": layout(UsersComponent),
  "/users/:id": layout(UserComponent),
  "/categories": layout(CategoriesComponent),
  "/products": layout(ProductsComponent),
  "/products/:id": layout(ProductComponent),
});

},{"./category/categoriescomponent":1,"./dashboard":3,"./layout/layout":6,"./product/product":11,"./product/productscomponent":12,"./user/usercomponent":14,"./user/userscomponent":15}],11:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {}
  this.id = m.prop(data.id || 0)
    this.name = m.prop(data.name || '')
    this.ispublished = m.prop(data.isPublished || false)
    this.categoryname = m.prop(data.categoryName || '')
    this.categoryid = m.prop(data.categoryId || 0)
    this.description = m.prop(data.description || '')
    this.image = m.prop(data.image || '')
    this.price = m.prop(data.price || null)
    this.meta = m.prop(metadata(data.meta))
    this.__RequestVerificationToken = m.prop(gettoken())
}

},{}],12:[function(require,module,exports){
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

module.exports = PagesComponent;

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./product":11}],13:[function(require,module,exports){
'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.ID || 0);
  this.name = m.prop(data.name || '');
  this.email = m.prop(data.email || '');
  this.current_password = m.prop(data.current_password || '');
  this.password = m.prop(data.password || '');
  this.password_confirm = m.prop(data.password_confirm || '');
}

},{}],14:[function(require,module,exports){
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./user":13}],15:[function(require,module,exports){
'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var PageSizeSelector = require("../layout/pagesizeselector");
var Paginator = require("../layout/paginator");
var User = require("./usercomponent");

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
  ctrl.pagesize = m.prop(getCookie("pagesize") || 10); //number of items per page
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
        m('table.table.table-striped.animated.fadeIn', sorts(ctrl.vm.list()), [
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

},{"../helpers/funcs":4,"../helpers/model":5,"../layout/pagesizeselector":7,"../layout/paginator":8,"../layout/spinner":9,"./usercomponent":14}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvY2F0ZWdvcnkvY2F0ZWdvcmllc2NvbXBvbmVudC5qcyIsImFzc2V0cy9qcy9jYXRlZ29yeS9jYXRlZ29yeS5qcyIsImFzc2V0cy9qcy9kYXNoYm9hcmQuanMiLCJhc3NldHMvanMvaGVscGVycy9mdW5jcy5qcyIsImFzc2V0cy9qcy9oZWxwZXJzL21vZGVsLmpzIiwiYXNzZXRzL2pzL2xheW91dC9sYXlvdXQuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3IuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2luYXRvci5qcyIsImFzc2V0cy9qcy9sYXlvdXQvc3Bpbm5lci5qcyIsImFzc2V0cy9qcy9tYWluLmpzIiwiYXNzZXRzL2pzL3Byb2R1Y3QvcHJvZHVjdC5qcyIsImFzc2V0cy9qcy9wcm9kdWN0L3Byb2R1Y3RzY29tcG9uZW50LmpzIiwiYXNzZXRzL2pzL3VzZXIvdXNlci5qcyIsImFzc2V0cy9qcy91c2VyL3VzZXJjb21wb25lbnQuanMiLCJhc3NldHMvanMvdXNlci91c2Vyc2NvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbnZhciBmdW5jcyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2Z1bmNzXCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvbW9kZWxcIik7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvc3Bpbm5lclwiKTtcbnZhciBQYWdlU2l6ZVNlbGVjdG9yID0gcmVxdWlyZShcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCIpO1xudmFyIFBhZ2luYXRvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCIpO1xudmFyIENhdGVnb3J5ID0gcmVxdWlyZSgnLi9jYXRlZ29yeScpO1xuXG5cbnZhciBDYXRlZ29yaWVzQ29tcG9uZW50ID0ge307XG5DYXRlZ29yaWVzQ29tcG9uZW50LnZtID0ge307XG5DYXRlZ29yaWVzQ29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gIGFyZ3MgPSBhcmdzIHx8IHt9O1xuICB2YXIgdm0gPSB0aGlzO1xuICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvY2F0ZWdvcmllc1wiLCB0eXBlOiBDYXRlZ29yeX0pO1xuICB2bS5saXN0ID0gdm0ubW9kZWwuaW5kZXgoKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5DYXRlZ29yaWVzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gQ2F0ZWdvcmllc0NvbXBvbmVudC52bS5pbml0KCk7XG4gIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KTsgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YLQtdCz0L7RgNC40Lgg0YLQvtCy0LDRgNC+0LJcIjtcbiAgY3RybC5lZGl0aW5naWQgPSBtLnByb3AoJycpOyAvL2lkIG9mIHRoZSByb3csIHRoYXQgaXMgYmVpbmcgZWRpdGVkXG4gIGN0cmwucmVjb3JkID0gbS5wcm9wKCcnKTsgLy90ZW1wb3Jhcnkgc3RhdGUgb2YgdGhlIHJvdywgdGhhdCBpcyBiZWluZyBlZGl0ZWRcbiAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChmdW5jcy5nZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCk7IC8vbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlXG4gIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCk7IC8vY3VycmVudCBwYWdlLCBzdGFydGluZyB3aXRoIDBcbiAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgY3RybC5zdGFydGVkaXQgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLmVkaXRpbmdpZChyb3cuaWQoKSk7XG4gICAgY3RybC5yZWNvcmQgPSBuZXcgQ2F0ZWdvcnkoe2lkOiByb3cuaWQoKSwgaXNQdWJsaXNoZWQ6IHJvdy5pc3B1Ymxpc2hlZCgpLCBuYW1lOiByb3cubmFtZSgpfSk7XG4gIH1cbiAgY3RybC51cGRhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgY3RybC52bS5tb2RlbC51cGRhdGUoY3RybC5yZWNvcmQpXG4gICAgICAudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgICBjdHJsLmVkaXRpbmdpZCgnJyk7XG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVtjdHJsLnZtLmxpc3QoKS5pbmRleE9mKHJvdyldID0gY3RybC5yZWNvcmQ7IC8vdXBkYXRlIGN1cnJlbnQgcm93IGluIGdyaWRcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7Y3RybC5lcnJvcihwYXJzZUVycm9yKGVycm9yKSl9XG4gICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpfSk7XG4gIH1cbiAgY3RybC5zdGFydGNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGN0cmwuZWRpdGluZ2lkKCduZXcnKTtcbiAgICBjdHJsLnJlY29yZCA9IG5ldyBDYXRlZ29yeSh7aWQ6IDAsIGlzUHVibGlzaGVkOiB0cnVlLCBuYW1lOiAnJ30pO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIGN0cmwudm0ubW9kZWwuY3JlYXRlKGN0cmwucmVjb3JkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpO1xuICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjdHJsLmVkaXRpbmdpZCgnJyk7XG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgICBtLnJlZHJhdygpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLmVycm9yKHBhcnNlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG4gIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy9wcmV2ZW50IHRyLm9uY2xpY2sgdHJpZ2dlclxuICAgIGN0cmwudm0ubW9kZWwuZGVsZXRlKHJvdy5pZCgpKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpO1xuICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY3RybC5jdXJyZW50cGFnZSgpKzEgPiBmdW5jcy5wYWdlcyhjdHJsLnZtLmxpc3QoKS5sZW5ndGgsIGN0cmwucGFnZXNpemUoKSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGN0cmwuY3VycmVudHBhZ2UoTWF0aC5tYXgoY3RybC5jdXJyZW50cGFnZSgpLTEsIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbiAgY3RybC5jYW5jZWxlZGl0ID0gZnVuY3Rpb24oKXsgY3RybC5lZGl0aW5naWQoJycpIH1cbn1cbkNhdGVnb3JpZXNDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgdmFyIGVkaXRSb3dUZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gW1xuICAgICAgbSgndHInLCB7XG4gICAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGluaXQpIHtcbiAgICAgICAgICBpZiggIWluaXQgKSB7XG4gICAgICAgICAgICBlbC5vbmtleXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDEzKSBjdHJsLnVwZGF0ZShkYXRhKVxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMjcpIHsgY3RybC5jYW5jZWxlZGl0KCk7IG0ucmVkcmF3KCk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBbXG4gICAgICBtKCd0ZC5zaHJpbmsnLCBjdHJsLnJlY29yZC5pZCgpKSxcbiAgICAgIG0oJ3RkJywgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge1xuICAgICAgICBjb25maWc6IGZ1bmN0aW9uKGVsLCBpbml0KSB7XG4gICAgICAgICAgaWYoICFpbml0ICkgZWwuZm9jdXMoKVxuICAgICAgICB9LFxuICAgICAgICB2YWx1ZTogY3RybC5yZWNvcmQubmFtZSgpLCBcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnJlY29yZC5uYW1lKVxuICAgICAgfSkpLFxuICAgICAgbSgndGQuc2hyaW5rJyxcbiAgICAgICAgbSgnaW5wdXRbdHlwZT1jaGVja2JveF0nLCB7IGNoZWNrZWQ6IGN0cmwucmVjb3JkLmlzcHVibGlzaGVkKCksIG9uY2xpY2s6IG0ud2l0aEF0dHIoXCJjaGVja2VkXCIsIGN0cmwucmVjb3JkLmlzcHVibGlzaGVkKX0pXG4gICAgICAgKSxcbiAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJywgW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCh0L7RhdGA0LDQvdC40YLRjF0nLCB7b25jbGljazogY3RybC51cGRhdGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtY2hlY2snKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90J7RgtC80LXQvdCwXScsIHtvbmNsaWNrOiBjdHJsLmNhbmNlbGVkaXR9LCBtKCdpLmZhLmZhLXRpbWVzJykpXG4gICAgICBdKVxuICAgICAgXSksIC8vdHJcbiAgICAgIGN0cmwuZXJyb3IoKVxuICAgICAgICA/IG0oJ3RyLmVycm9yLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgICAgICAgIG0oJ3RkJyksXG4gICAgICAgICAgICBtKCd0ZC50ZXh0LWRhbmdlcltjb2xzcGFuPTJdJywgY3RybC5lcnJvcigpKSxcbiAgICAgICAgICAgIG0oJ3RkJylcbiAgICAgICAgXSlcbiAgICAgICAgOiBcIlwiXG4gICAgICAgIF07XG4gIH0gLy9lZGl0Um93VGVtcGxhdGVcblxuICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXG4gICAgICAgIFtcbiAgICAgICAgbSgndGQuc2hyaW5rJywgZGF0YS5pZCgpKSxcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluay50ZXh0LWNlbnRlcicsIGRhdGEuaXNwdWJsaXNoZWQoKSA/IG0oJ2kuZmEuZmEtY2hlY2snKSA6IG0oJ2kuZmEuZmEtdGltZXMnKSksXG4gICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJyxbXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90KDQtdC00LDQutGC0LjRgNC+0LLQsNGC0YxdJywge29uY2xpY2s6IGN0cmwuc3RhcnRlZGl0LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXBlbmNpbCcpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGFuZ2VyW3RpdGxlPdCj0LTQsNC70LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmRlbGV0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1yZW1vdmUnKSlcbiAgICAgICAgXSlcbiAgICAgICAgXVxuICAgICAgICApO1xuICB9IC8vc2hvd1Jvd1RlbXBsYXRlXG5cbiAgdmFyIGNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBbXG4gICAgICBtKCd0cicsIHtcbiAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xuICAgICAgICAgIGlmKCAhaW5pdCApIHtcbiAgICAgICAgICAgIGVsLm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIGN0cmwuY3JlYXRlKClcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDI3KSB7IGN0cmwuY2FuY2VsZWRpdCgpOyBtLnJlZHJhdygpOyByZXR1cm4gfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFtcbiAgICAgIG0oJ3RkLnNocmluaycpLFxuICAgICAgbSgndGQnLCBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7XG4gICAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGluaXQpIHtcbiAgICAgICAgICBpZiggIWluaXQgKSBlbC5mb2N1cygpXG4gICAgICAgIH0sXG4gICAgICAgIHZhbHVlOiBjdHJsLnJlY29yZC5uYW1lKCksIFxuICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwucmVjb3JkLm5hbWUpXG4gICAgICB9KSksXG4gICAgICBtKCd0ZC5zaHJpbmsnLFxuICAgICAgICBtKCdpbnB1dFt0eXBlPWNoZWNrYm94XScsIHsgY2hlY2tlZDogY3RybC5yZWNvcmQuaXNwdWJsaXNoZWQoKSwgb25jbGljazogbS53aXRoQXR0cihcImNoZWNrZWRcIiwgY3RybC5yZWNvcmQuaXNwdWJsaXNoZWQpfSlcbiAgICAgICApLFxuICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLCBbXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90KHQvtC30LTQsNGC0YxdJywge29uY2xpY2s6IGN0cmwuY3JlYXRlfSwgbSgnaS5mYS5mYS1jaGVjaycpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QntGC0LzQtdC90LBdJywge29uY2xpY2s6IGN0cmwuY2FuY2VsZWRpdH0sIG0oJ2kuZmEuZmEtdGltZXMnKSlcbiAgICAgIF0pXG4gICAgICBdXG4gICAgICApLCAvL3RyXG4gICAgICBjdHJsLmVycm9yKClcbiAgICAgICAgPyBtKCd0ci5lcnJvci5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICAgICAgICBtKCd0ZCcpLFxuICAgICAgICAgICAgbSgndGQudGV4dC1kYW5nZXJbY29sc3Bhbj0yXScsIGN0cmwuZXJyb3IoKSksXG4gICAgICAgICAgICBtKCd0ZCcpXG4gICAgICAgIF0pXG4gICAgICAgIDogXCJcIlxuICAgICAgICBdO1xuICB9IC8vY3JlYXRlVGVtcGxhdGVcblxuICAvL2NvbXBsZXRlIHZpZXdcbiAgcmV0dXJuIG0oXCIjY2F0ZWdvcnlsaXN0XCIsIFtcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBzb3J0cyhjdHJsLnZtLmxpc3QoKSksIFtcbiAgICAgICAgICBtKCd0aGVhZCcsIFxuICAgICAgICAgICAgbSgndHInLCBbXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlkXScsICfihJYnKSxcbiAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQndCw0LfQstCw0L3QuNC1JyksXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlzcHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiAoY3RybC5lZGl0aW5naWQoKSA9PSBkYXRhLmlkKCkpID8gZWRpdFJvd1RlbXBsYXRlKGRhdGEpIDogc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgKCFjdHJsLnZtLmxpc3QoKS5sZW5ndGgpIFxuICAgICAgICAgICAgPyBtKCd0cicsIG0oJ3RkLnRleHQtY2VudGVyLnRleHQtbXV0ZWRbY29sc3Bhbj00XScsICfQodC/0LjRgdC+0Log0L/Rg9GB0YIsINC90LDQttC80LjRgtC1INCU0L7QsdCw0LLQuNGC0YwsINGH0YLQvtCx0Ysg0YHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQt9Cw0L/QuNGB0YwuJykpXG4gICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICAoY3RybC5lZGl0aW5naWQoKSA9PSBcIm5ld1wiKSA/IGNyZWF0ZVRlbXBsYXRlKCkgOiBcIlwiLFxuICAgICAgICAgICAgY3RybC51cGRhdGluZygpID8gbS5jb21wb25lbnQoU3Bpbm5lcikgOiBcIlwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIpXG4gICAgICAgICAgICksIC8vdGJvZHlcbiAgICAgICAgICBdKSwgLy90YWJsZVxuICAgICAgICAgIG0oJy5hY3Rpb25zJywgW1xuICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5JywgeyBvbmNsaWNrOiBjdHJsLnN0YXJ0Y3JlYXRlIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcbiAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQsNGC0LXQs9C+0YDQuNGOJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgY3RybC52bS5saXN0KCkgPyBtLmNvbXBvbmVudChQYWdpbmF0b3IsIHtsaXN0OiBjdHJsLnZtLmxpc3QsIHBhZ2VzaXplOiBjdHJsLnBhZ2VzaXplLCBjdXJyZW50cGFnZTogY3RybC5jdXJyZW50cGFnZSwgb25zZXRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlfSkgOiBcIlwiLFxuICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYXRlZ29yaWVzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLklEIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5pc19wdWJsaXNoZWQgPSBtLnByb3AoZGF0YS5pc19wdWJsaXNoZWQgfHwgZmFsc2UpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgRGFzaGJvYXJkQ29tcG9uZW50ID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0J/QsNC90LXQu9GMINCw0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGA0LBcIjtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gbShcImgxXCIsIGN0cmwudGl0bGUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGFzaGJvYXJkQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnBhZ2VzID0gZnVuY3Rpb24oYXJsZW4sIHBhZ2VzaXplKSB7XG4gIHJldHVybiBBcnJheShNYXRoLmZsb29yKGFybGVuL3BhZ2VzaXplKSArICgoYXJsZW4lcGFnZXNpemUgPiAwKSA/IDEgOiAwKSkuZmlsbCgwKTsgLy9yZXR1cm4gZW1wdHkgYXJyYXkgb2YgcGFnZXNcbn1cblxuZXhwb3J0cy5zb3J0cyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgcmV0dXJuIHtcbiAgICBvbmNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgcHJvcCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1ieVwiKTtcbiAgICAgIGlmIChwcm9wKSB7XG4gICAgICAgIHZhciBmaXJzdCA9IGxpc3RbMF07XG4gICAgICAgIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGFbcHJvcF0oKSA+IGJbcHJvcF0oKSA/IDEgOiBhW3Byb3BdKCkgPCBiW3Byb3BdKCkgPyAtMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZmlyc3QgPT09IGxpc3RbMF0pIGxpc3QucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLm1yZXF1ZXN0ID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgbm9uSnNvbkVycm9ycyA9IGZ1bmN0aW9uKHhocikge1xuICAgIHJldHVybiAoeGhyLnN0YXR1cyA+IDIwNCAmJiB4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aCkgXG4gICAgICA/IEpTT04uc3RyaW5naWZ5KHhoci5yZXNwb25zZVRleHQpIFxuICAgICAgOiAoeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGgpXG4gICAgICA/IHhoci5yZXNwb25zZVRleHRcbiAgICAgIDogbnVsbDtcbiAgfVxuICBhcmdzLmV4dHJhY3QgPSBub25Kc29uRXJyb3JzO1xuICByZXR1cm4gbS5yZXF1ZXN0KGFyZ3MpO1xufVxuXG5leHBvcnRzLnNldENvb2tpZSA9IGZ1bmN0aW9uKGNuYW1lLCBjdmFsdWUsIGV4ZGF5cykge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMqMjQqNjAqNjAqMTAwMCkpO1xuICB2YXIgZXhwaXJlcyA9IFwiZXhwaXJlcz1cIisgZC50b1VUQ1N0cmluZygpO1xuICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG59XG5cbmV4cG9ydHMuZ2V0Q29va2llID0gZnVuY3Rpb24oY25hbWUpIHtcbiAgdmFyIG5hbWUgPSBjbmFtZSArIFwiPVwiO1xuICB2YXIgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcbiAgZm9yKHZhciBpID0gMDsgaSA8Y2EubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYyA9IGNhW2ldO1xuICAgIHdoaWxlIChjLmNoYXJBdCgwKT09JyAnKSB7XG4gICAgICBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT0gMCkge1xuICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLGMubGVuZ3RoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFwiXCI7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtcmVxdWVzdCA9IHJlcXVpcmUoXCIuL2Z1bmNzXCIpLm1yZXF1ZXN0O1xuXG4vL2FyZ3M6IHt1cmw6IFwiL2FwaS9leGFtcGxlXCIsIHR5cGU6IE9iamVjdFR5cGV9XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciBtb2RlbCA9IHRoaXM7XG5cbiAgbW9kZWwuaW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJHRVRcIiwgXG4gICAgICB1cmw6IGFyZ3MudXJsLCBcbiAgICAgIHR5cGU6IGFyZ3MudHlwZVxuICAgIH0pXG4gIH07XG4gIG1vZGVsLmdldCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0KHtcbiAgICAgIGJhY2tncm91bmQ6IHRydWUsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsIFxuICAgICAgdXJsOiBhcmdzLnVybCArIFwiL1wiICsgaWQsXG4gICAgICB0eXBlOiBhcmdzLnR5cGVcbiAgICB9KVxuICB9O1xuICBtb2RlbC5jcmVhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG1yZXF1ZXN0ICh7XG4gICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIHVybDogYXJncy51cmwsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgIH0pXG4gIH07XG4gIG1vZGVsLnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgIHVybDogYXJncy51cmwgKyBcIi9cIiArIGRhdGEoKS5pZCgpLFxuICAgICAgZGF0YTogZGF0YSxcbiAgICB9KVxuICB9O1xuICBtb2RlbC5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiBtcmVxdWVzdCh7XG4gICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgdXJsOiBhcmdzLnVybCArIFwiL1wiICsgaWQsXG4gICAgfSlcbiAgfTtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBsYXlvdXQoY29tcG9uZW50KSB7XG4gIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIiwgXG4gICAgICB1cmw6IFwiL2FwaS9sb2dvdXRcIiwgXG4gICAgfSkudGhlbigoc3VjY2VzcykgPT4ge3dpbmRvdy5sb2NhdGlvbiA9IFwiL1wiO30pXG4gIH1cblxuICB2YXIgaGVhZGVyID0gbShcIm5hdi5uYXZiYXIubmF2YmFyLWRlZmF1bHRcIiwgW1xuICAgICAgbSgnLm5hdmJhci1oZWFkZXInLCBbXG4gICAgICAgIG0oJ2J1dHRvbi5uYXZiYXItdG9nZ2xlLmNvbGxhcHNlZFt0eXBlPVwiYnV0dG9uXCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGRhdGEtdGFyZ2V0PVwiI25hdmJhci1jb2xsYXBzZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiXScsIFtcbiAgICAgICAgICBtKCdzcGFuLnNyLW9ubHknLCBcIlRvZ2dsZSBuYXZpZ2F0aW9uXCIpLFxuICAgICAgICAgIG0oJ3NwYW4uaWNvbi1iYXInKSxcbiAgICAgICAgICBtKCdzcGFuLmljb24tYmFyJyksXG4gICAgICAgICAgbSgnc3Bhbi5pY29uLWJhcicpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdhLm5hdmJhci1icmFuZFtocmVmPVwiI1wiXScsIFwi0J/QsNC90LXQu9GMINCw0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGA0LBcIilcbiAgICAgIF0pLFxuICAgICAgbSgnLmNvbGxhcHNlIG5hdmJhci1jb2xsYXBzZSNuYXZiYXItY29sbGFwc2UnLCBbXG4gICAgICAgIG0oJ3VsLm5hdi5uYXZiYXItbmF2Lm5hdmJhci1yaWdodCcsIFtcbiAgICAgICAgICBtKCdsaScsIFxuICAgICAgICAgICAgbSgnYVtocmVmPVwiL1wiXScsIFtcbiAgICAgICAgICAgICAgbSgnaS5mYS5mYS1wbGF5JyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCBcItCh0LDQudGCXCIpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ2xpJywgXG4gICAgICAgICAgICBtKCdhW2hyZWY9XCIjXCJdJywge29uY2xpY2s6IGxvZ291dH0sIFtcbiAgICAgICAgICAgICAgbSgnaS5mYS5mYS1zaWduLW91dCcpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgXCLQktGL0LnRgtC4XCIpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgICAgICBdKTtcblxuICAgICAgICB2YXIgbmF2bGluayA9IGZ1bmN0aW9uICh1cmwsIHRpdGxlKSB7XG4gICAgICAgICAgcmV0dXJuIG0oJ2xpJywgeyBjbGFzczogKG0ucm91dGUoKS5pbmNsdWRlcyh1cmwpKSA/IFwiYWN0aXZlXCIgOiBcIlwiIH0sIG0oJ2EnLCB7IGhyZWY6IHVybCwgY29uZmlnOiBtLnJvdXRlIH0sIHRpdGxlKSk7XG4gICAgICAgIH1cbiAgdmFyIHNpZGViYXIgPSBbXG4gICAgbSgnLnBhbmVsLnBhbmVsLWRlZmF1bHQnLCBbXG4gICAgICAgIG0oJ3VsLm5hdiBuYXYtcGlsbHMgbmF2LXN0YWNrZWQnLCBbXG4gICAgICAgICAgbmF2bGluayhcIi9jYXRlZ29yaWVzXCIsIFwi0JrQsNGC0LXQs9C+0YDQuNC4INGC0L7QstCw0YDQvtCyXCIpLFxuICAgICAgICAgIG5hdmxpbmsoXCIvcHJvZHVjdHNcIiwgXCLQotC+0LLQsNGA0YtcIiksXG4gICAgICAgICAgbmF2bGluayhcIi91c2Vyc1wiLCBcItCf0L7Qu9GM0LfQvtCy0LDRgtC10LvQuFwiKSxcbiAgICAgICAgXSlcbiAgICBdKVxuICBdO1xuXG4gIHZhciBmb290ZXIgPSBbXG4gIG0oJ2Zvb3RlciNmb290ZXInLCBbXG4gICAgICBtKCdkaXYnLCBcItCf0L7QtNCy0LDQuyDRgdCw0LnRgtCwXCIpXG4gIF0pXG4gIF07XG4gIHJldHVybiBbXG4gIGhlYWRlcixcbiAgbShcIiNjb250ZW50LXdyYXBwZXJcIiwgW1xuICAgICAgbSgnI3NpZGViYXInLCBzaWRlYmFyKSxcbiAgICAgIG0oJyNjb250ZW50JywgbS5jb21wb25lbnQoY29tcG9uZW50KSlcbiAgXSksXG4gIGZvb3RlclxuICBdO1xufTtcblxuZnVuY3Rpb24gbWl4aW5MYXlvdXQobGF5b3V0LCBjb21wb25lbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbGF5b3V0KGNvbXBvbmVudCk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgcmV0dXJuIHsgY29udHJvbGxlcjogZnVuY3Rpb24gKCkgeyB9LCB2aWV3OiBtaXhpbkxheW91dChsYXlvdXQsIGNvbXBvbmVudCkgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2V0Q29va2llID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvZnVuY3NcIikuc2V0Q29va2llO1xuXG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHt9O1xuXG4vL2FyZyBpcyBhbiBtLnByb3Agb2YgcGFnZXNpemUgaW4gdGhlIHBhcmVudCBjb250cm9sbGVyXG5QYWdlU2l6ZVNlbGVjdG9yLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmcpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuICBjdHJsLnNldHBhZ2VzaXplID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIGFyZyhzaXplKTtcbiAgICBzZXRDb29raWUoXCJwYWdlc2l6ZVwiLCBzaXplLCAzNjUpOyAvL3N0b3JlIHBhZ2VzaXplIGluIGNvb2tpZXNcbiAgICBtLnJlZHJhdygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cblxuUGFnZVNpemVTZWxlY3Rvci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJnKSB7XG4gIHJldHVybiBtKCcjcGFnZXNpemVzZWxlY3RvcicsIFtcbiAgICAgIG0oJ3NwYW4nLCBcItCf0L7QutCw0LfRi9Cy0LDRgtGMINC90LAg0YHRgtGA0LDQvdC40YbQtTogXCIpLFxuICAgICAgWzEwLCA1MCwgMTAwLCA1MDBdLm1hcChmdW5jdGlvbihzaXplKSB7XG4gICAgICAgIHJldHVybiBtKCdhW2hyZWY9I10nLCB7Y2xhc3M6IChzaXplID09IGFyZygpKSA/ICdhY3RpdmUnIDogJycsIG9uY2xpY2s6IGN0cmwuc2V0cGFnZXNpemUuYmluZCh0aGlzLCBzaXplKX0sIHNpemUpXG4gICAgICB9KVxuICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlU2l6ZVNlbGVjdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGFnZXMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2Z1bmNzJykucGFnZXM7XG52YXIgUGFnaW5hdG9yID0ge307XG5cblBhZ2luYXRvci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICB2YXIgY3RybCA9IHRoaXM7XG4gIGN0cmwuc2V0cGFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgYXJncy5vbnNldHBhZ2UoaW5kZXgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5QYWdpbmF0b3IudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgcmV0dXJuIG0oJyNwYWdpbmF0b3InLCBcbiAgICAgIChhcmdzLmxpc3QoKS5sZW5ndGggPiBhcmdzLnBhZ2VzaXplKCkpXG4gICAgICA/IG0oJ25hdicsIFtcbiAgICAgICAgbSgndWwucGFnaW5hdGlvbicsIFxuICAgICAgICAgIHBhZ2VzKGFyZ3MubGlzdCgpLmxlbmd0aCwgYXJncy5wYWdlc2l6ZSgpKVxuICAgICAgICAgIC5tYXAoZnVuY3Rpb24ocCwgaW5kZXgpe1xuICAgICAgICAgICAgcmV0dXJuIG0oJ2xpJywge2NsYXNzOiAoaW5kZXggPT0gYXJncy5jdXJyZW50cGFnZSgpKSA/ICdhY3RpdmUnIDogJyd9LCBcbiAgICAgICAgICAgICAgICAoaW5kZXggPT0gYXJncy5jdXJyZW50cGFnZSgpKVxuICAgICAgICAgICAgICAgID8gbSgnc3BhbicsIGluZGV4KzEpXG4gICAgICAgICAgICAgICAgOiBtKCdhW2hyZWY9L10nLCB7b25jbGljazogY3RybC5zZXRwYWdlLmJpbmQodGhpcywgaW5kZXgpfSwgaW5kZXgrMSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgfSlcbiAgICAgICAgIClcbiAgICAgIF0pXG4gICAgICA6IFwiXCJcbiAgICAgICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9hZGluZ1NwaW5uZXIgPSB7fTtcblxuTG9hZGluZ1NwaW5uZXIuY29udHJvbGxlciA9IGZ1bmN0aW9uKCkge31cbkxvYWRpbmdTcGlubmVyLnZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHJldHVybiBtKCcjbG9hZGluZy1zcGlubmVyLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgIG0oJ3AudGV4dC1jZW50ZXInLCBtKCdpLmZhLmZhLXNwaW4uZmEtY29nLmZhLTN4JykpLFxuICAgICAgbSgncC50ZXh0LWNlbnRlcicsICfQn9C+0LTQvtC20LTQuNGC0LUsINC40LTQtdGCINC30LDQs9GA0YPQt9C60LAuLi4nKVxuICBdKTtcbn1cblxudmFyIFVwZGF0aW5nU3Bpbm5lciA9IHt9O1xuXG5VcGRhdGluZ1NwaW5uZXIuY29udHJvbGxlciA9IGZ1bmN0aW9uKGFyZ3MpIHt9XG5VcGRhdGluZ1NwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgcmV0dXJuIG0oJyN1cGRhdGluZy1zcGlubmVyLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgIG0oJ3Ajc3Bpbm5lci10ZXh0JywgbSgnaS5mYS5mYS1zcGluLmZhLWNvZy5mYS0zeCcpKSxcbiAgXSk7XG59XG5cbnZhciBTcGlubmVyID0ge307XG5TcGlubmVyLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBjdHJsID0gdGhpcztcbiAgY3RybC5zdGFuZGFsb25lID0gKGFyZ3MgJiYgYXJncy5zdGFuZGFsb25lKSA/IHRydWUgOiBmYWxzZTtcbn1cblNwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgcmV0dXJuIG0oJyNzcGlubmVyJywgXG4gICAgICAoY3RybC5zdGFuZGFsb25lKSBcbiAgICAgID8gbS5jb21wb25lbnQoTG9hZGluZ1NwaW5uZXIpIFxuICAgICAgOiBtLmNvbXBvbmVudChVcGRhdGluZ1NwaW5uZXIpXG4gICAgICApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3Bpbm5lcjtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxudmFyIERhc2hib2FyZENvbXBvbmVudCA9IHJlcXVpcmUoXCIuL2Rhc2hib2FyZFwiKTtcbnZhciBDYXRlZ29yaWVzQ29tcG9uZW50ID0gcmVxdWlyZShcIi4vY2F0ZWdvcnkvY2F0ZWdvcmllc2NvbXBvbmVudFwiKTtcbnZhciBQcm9kdWN0c0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3Byb2R1Y3QvcHJvZHVjdHNjb21wb25lbnRcIik7XG52YXIgUHJvZHVjdENvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3Byb2R1Y3QvcHJvZHVjdFwiKTtcbnZhciBVc2Vyc0NvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3VzZXIvdXNlcnNjb21wb25lbnRcIik7XG52YXIgVXNlckNvbXBvbmVudCA9IHJlcXVpcmUoXCIuL3VzZXIvdXNlcmNvbXBvbmVudFwiKTtcbnZhciBsYXlvdXQgPSByZXF1aXJlKFwiLi9sYXlvdXQvbGF5b3V0XCIpO1xuXG4vL3NldHVwIHJvdXRlcyB0byBzdGFydCB3LyB0aGUgYCNgIHN5bWJvbFxubS5yb3V0ZS5tb2RlID0gXCJoYXNoXCI7XG5cbm0ucm91dGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZG1pbi1hcHBcIiksIFwiL1wiLCB7XG4gIFwiL1wiOiBsYXlvdXQoRGFzaGJvYXJkQ29tcG9uZW50KSxcbiAgXCIvdXNlcnNcIjogbGF5b3V0KFVzZXJzQ29tcG9uZW50KSxcbiAgXCIvdXNlcnMvOmlkXCI6IGxheW91dChVc2VyQ29tcG9uZW50KSxcbiAgXCIvY2F0ZWdvcmllc1wiOiBsYXlvdXQoQ2F0ZWdvcmllc0NvbXBvbmVudCksXG4gIFwiL3Byb2R1Y3RzXCI6IGxheW91dChQcm9kdWN0c0NvbXBvbmVudCksXG4gIFwiL3Byb2R1Y3RzLzppZFwiOiBsYXlvdXQoUHJvZHVjdENvbXBvbmVudCksXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKXtcbiAgZGF0YSA9IGRhdGEgfHwge31cbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApXG4gICAgdGhpcy5uYW1lID0gbS5wcm9wKGRhdGEubmFtZSB8fCAnJylcbiAgICB0aGlzLmlzcHVibGlzaGVkID0gbS5wcm9wKGRhdGEuaXNQdWJsaXNoZWQgfHwgZmFsc2UpXG4gICAgdGhpcy5jYXRlZ29yeW5hbWUgPSBtLnByb3AoZGF0YS5jYXRlZ29yeU5hbWUgfHwgJycpXG4gICAgdGhpcy5jYXRlZ29yeWlkID0gbS5wcm9wKGRhdGEuY2F0ZWdvcnlJZCB8fCAwKVxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBtLnByb3AoZGF0YS5kZXNjcmlwdGlvbiB8fCAnJylcbiAgICB0aGlzLmltYWdlID0gbS5wcm9wKGRhdGEuaW1hZ2UgfHwgJycpXG4gICAgdGhpcy5wcmljZSA9IG0ucHJvcChkYXRhLnByaWNlIHx8IG51bGwpXG4gICAgdGhpcy5tZXRhID0gbS5wcm9wKG1ldGFkYXRhKGRhdGEubWV0YSkpXG4gICAgdGhpcy5fX1JlcXVlc3RWZXJpZmljYXRpb25Ub2tlbiA9IG0ucHJvcChnZXR0b2tlbigpKVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBQcm9kdWN0ID0gcmVxdWlyZShcIi4vcHJvZHVjdFwiKTtcblxudmFyIFByb2R1Y3RzQ29tcG9uZW50ID0ge307XG5Qcm9kdWN0c0NvbXBvbmVudC52bSA9IHt9O1xuUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wcm9kdWN0c1wiLCB0eXBlOiBQcm9kdWN0fSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cblByb2R1Y3RzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gUHJvZHVjdHNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyXCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuc3RhcnRlZGl0ID0gZnVuY3Rpb24ocm93KSB7XG4gICAgY29uc29sZS5sb2coJ1VzZSBtLnJvdXRlIHRvIHJlZGlyZWN0Jyk7XG4gIH1cbiAgY3RybC5zdGFydGNyZWF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvcHJvZHVjdHMvbmV3XCIpO1xuICB9XG4gIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgY3RybC51cGRhdGluZyh0cnVlKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy9wcmV2ZW50IHRyLm9uY2xpY2sgdHJpZ2dlclxuICAgIGN0cmwudm0ubW9kZWwuZGVsZXRlKHJvdy5pZCgpKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpO1xuICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY3RybC5jdXJyZW50cGFnZSgpKzEgPiBmdW5jcy5wYWdlcyhjdHJsLnZtLmxpc3QoKS5sZW5ndGgsIGN0cmwucGFnZXNpemUoKSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGN0cmwuY3VycmVudHBhZ2UoTWF0aC5tYXgoY3RybC5jdXJyZW50cGFnZSgpLTEsIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgICk7XG4gIH1cbn1cblByb2R1Y3RzQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG0oJ3RyLmNsaWNrYWJsZScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgW1xuICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLmlkKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsnLCAoZGF0YS5pbWFnZSgpKSA/IG0oJ2ltZy5pbWFnZS1wcmV2aWV3LmltZy1yZXNwb25zaXZlJywge3NyYzogZGF0YS5pbWFnZSgpfSkgOiBcIlwiKSxcbiAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuY2F0ZWdvcnluYW1lKCkpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsudGV4dC1jZW50ZXInLCBkYXRhLmlzcHVibGlzaGVkKCkgPyBtKCdpLmZhLmZhLWNoZWNrJykgOiBtKCdpLmZhLmZhLXRpbWVzJykpLFxuICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXG4gICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRhbmdlclt0aXRsZT3Qo9C00LDQu9C40YLRjF0nLCB7b25jbGljazogY3RybC5kZWxldGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcmVtb3ZlJykpXG4gICAgICAgIF0pXG4gICAgICAgIF1cbiAgICAgICAgKTtcbiAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiNwcm9kdWN0bGlzdFwiLCBbXG4gICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICBtKCdkaXYnLCBbXG4gICAgICAgIG0oJ3RhYmxlLnRhYmxlLnRhYmxlLXN0cmlwZWQuYW5pbWF0ZWQuZmFkZUluJywgc29ydHMoY3RybC52bS5saXN0KCkpLCBbXG4gICAgICAgICAgbSgndGhlYWQnLCBcbiAgICAgICAgICAgIG0oJ3RyJywgW1xuICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1pZF0nLCAn4oSWJyksXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aW1hZ2VdJywgJ9Ck0L7RgtC+JyksXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9bmFtZV0nLCAn0J3QsNC30LLQsNC90LjQtScpLFxuICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWNhdGVnb3J5bmFtZV0nLCAn0JrQsNGC0LXQs9C+0YDQuNGPJyksXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlzcHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICApLFxuICAgICAgICAgIG0oJ3Rib2R5JywgXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBzaG93Um93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyKVxuICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5zdGFydGNyZWF0ZSB9LCBbXG4gICAgICAgICAgICAgICAgbSgnaS5mYS5mYS1wbHVzJyksXG4gICAgICAgICAgICAgICAgbSgnc3BhbicsICfQlNC+0LHQsNCy0LjRgtGMINGC0L7QstCw0YAnKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2VzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpe1xuICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLklEIHx8IDApO1xuICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKTtcbiAgdGhpcy5lbWFpbCA9IG0ucHJvcChkYXRhLmVtYWlsIHx8ICcnKTtcbiAgdGhpcy5jdXJyZW50X3Bhc3N3b3JkID0gbS5wcm9wKGRhdGEuY3VycmVudF9wYXNzd29yZCB8fCAnJyk7XG4gIHRoaXMucGFzc3dvcmQgPSBtLnByb3AoZGF0YS5wYXNzd29yZCB8fCAnJyk7XG4gIHRoaXMucGFzc3dvcmRfY29uZmlybSA9IG0ucHJvcChkYXRhLnBhc3N3b3JkX2NvbmZpcm0gfHwgJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi91c2VyJyk7XG5cbnZhciBVc2VyQ29tcG9uZW50ID0ge307XG5Vc2VyQ29tcG9uZW50LnZtID0ge307XG5Vc2VyQ29tcG9uZW50LnZtLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZtID0gdGhpcztcbiAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3VzZXJzXCIsIHR5cGU6IFVzZXJ9KTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgdm0ucmVjb3JkID0gbS5wcm9wKG5ldyBVc2VyKCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLnJlY29yZCA9ICB2bS5tb2RlbC5nZXQobS5yb3V0ZS5wYXJhbShcImlkXCIpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblVzZXJDb21wb25lbnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gIGN0cmwudm0gPSBVc2VyQ29tcG9uZW50LnZtLmluaXQoKTtcbiAgaWYgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKSB7XG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcChmYWxzZSk7XG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC+0LfQtNCw0L3QuNC1INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiO1xuICB9IGVsc2Uge1xuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSk7IC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICAgIGN0cmwudm0ucmVjb3JkLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YDRgtC+0YfQutCwINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiO1xuICB9XG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpOyAvL25vdGlmaWNhdGlvbnNcblxuICBjdHJsLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIG0ucm91dGUoXCIvdXNlcnNcIik7XG4gIH1cbiAgY3RybC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwudm0ucmVjb3JkKVxuICAgICAgLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3VjY2Vzcykge2N0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO30sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtjdHJsLmVycm9yKHBhcnNlRXJyb3IoZXJyb3IpKTt9XG4gICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpfSk7XG4gIH1cbiAgY3RybC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGN0cmwudXBkYXRpbmcodHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBjdHJsLm1lc3NhZ2UoJycpO1xuICAgIGN0cmwuZXJyb3IoJycpO1xuICAgIGN0cmwudm0ubW9kZWwuY3JlYXRlKGN0cmwudm0ucmVjb3JkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihzdWNjZXNzKSB7IG0ucm91dGUoXCIvdXNlcnNcIik7fSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjdHJsLmVycm9yKHBhcnNlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9XG59XG5Vc2VyQ29tcG9uZW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuXG4gIC8vY29tcGxldGUgdmlld1xuICByZXR1cm4gbShcIiN1c2VyXCIsIFtcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIGN0cmwudm0ucmVjb3JkKClcbiAgICAgID8gbSgnZm9ybS5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9CY0LzRjycpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5uYW1lKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5uYW1lKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQrdC7LiDQv9C+0YfRgtCwJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9ZW1haWxdJywge3ZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmVtYWlsKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5lbWFpbCl9KVxuICAgICAgICBdKSxcbiAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSAhPSBcIm5ld1wiKVxuICAgICAgICA/IG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgIG0oJ2xhYmVsJywgJ9Ci0LXQutGD0YnQuNC5INC/0LDRgNC+0LvRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbFt0eXBlPXBhc3N3b3JkXScsIHtwbGFjZWhvbGRlcjogXCLQntGB0YLQsNCy0YzRgtC1INC/0YPRgdGC0YvQvCwg0YfRgtC+0LHRiyDRgdC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40Lkg0L/QsNGA0L7Qu9GMXCIsIHZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLmN1cnJlbnRfcGFzc3dvcmQoKSwgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZtLnJlY29yZCgpLmN1cnJlbnRfcGFzc3dvcmQpfSlcbiAgICAgICAgXSlcbiAgICAgICAgOiBcIlwiLFxuICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICBtKCdsYWJlbCcsICfQndC+0LLRi9C5INC/0LDRgNC+0LvRjCcpLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbFt0eXBlPXBhc3N3b3JkXScsIHtwbGFjZWhvbGRlcjogXCLQntGB0YLQsNCy0YzRgtC1INC/0YPRgdGC0YvQvCwg0YfRgtC+0LHRiyDRgdC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40Lkg0L/QsNGA0L7Qu9GMXCIsIHZhbHVlOiBjdHJsLnZtLnJlY29yZCgpLnBhc3N3b3JkKCksIG9uY2hhbmdlOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgY3RybC52bS5yZWNvcmQoKS5wYXNzd29yZCl9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgbSgnbGFiZWwnLCAn0J/QvtC00YLQstC10YDQttC00LXQvdC40LUg0L/QsNGA0L7Qu9GPJyksXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sW3R5cGU9cGFzc3dvcmRdJywge3BsYWNlaG9sZGVyOiBcItCe0YHRgtCw0LLRjNGC0LUg0L/Rg9GB0YLRi9C8LCDRh9GC0L7QsdGLINGB0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQuSDQv9Cw0YDQvtC70YxcIiwgdmFsdWU6IGN0cmwudm0ucmVjb3JkKCkucGFzc3dvcmRfY29uZmlybSgpLCBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudm0ucmVjb3JkKCkucGFzc3dvcmRfY29uZmlybSl9KVxuICAgICAgICBdKSxcbiAgICAgICAgKGN0cmwubWVzc2FnZSgpKSA/IG0oJy5hY3Rpb24tbWVzc2FnZS5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwubWVzc2FnZSgpKSA6IFwiXCIsXG4gICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxuICAgICAgICBtKCcuYWN0aW9ucycsIFtcbiAgICAgICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIilcbiAgICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXG4gICAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0LfQtNCw0YLRjCcpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICAgOiBbXG4gICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5W3R5cGU9XCJzdWJtaXRcIl0nLCB7IG9uY2xpY2s6IGN0cmwudXBkYXRlLCBkaXNhYmxlZDogY3RybC51cGRhdGluZygpIH0sIFtcbiAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7RhdGA0LDQvdC40YLRjCcpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi13YXJuaW5nJywgeyBvbmNsaWNrOiBjdHJsLmNhbmNlbCB9LCBbXG4gICAgICAgICAgICAgIG0oJ2kuZmEuZmEtY2hldnJvbi1sZWZ0JyksXG4gICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0J7RgtC80LXQvdCwJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcbiAgICAgICAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVc2VyQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG52YXIgZnVuY3MgPSByZXF1aXJlKFwiLi4vaGVscGVycy9mdW5jc1wiKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL21vZGVsXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3NwaW5uZXJcIik7XG52YXIgUGFnZVNpemVTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiKTtcbnZhciBQYWdpbmF0b3IgPSByZXF1aXJlKFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiKTtcbnZhciBVc2VyID0gcmVxdWlyZShcIi4vdXNlcmNvbXBvbmVudFwiKTtcblxudmFyIFVzZXJzQ29tcG9uZW50ID0ge307XG5Vc2Vyc0NvbXBvbmVudC52bSA9IHt9O1xuVXNlcnNDb21wb25lbnQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MgfHwge307XG4gIHZhciB2bSA9IHRoaXM7XG4gIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS91c2Vyc1wiLCB0eXBlOiBVc2VyfSk7XG4gIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpO1xuICByZXR1cm4gdGhpcztcbn1cblVzZXJzQ29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdHJsID0gdGhpcztcblxuICBjdHJsLnZtID0gVXNlcnNDb21wb25lbnQudm0uaW5pdCgpO1xuICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpOyAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSk7IC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXG4gIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC5XCI7XG4gIGN0cmwucGFnZXNpemUgPSBtLnByb3AoZ2V0Q29va2llKFwicGFnZXNpemVcIikgfHwgMTApOyAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICBjdHJsLmN1cnJlbnRwYWdlID0gbS5wcm9wKDApOyAvL2N1cnJlbnQgcGFnZSwgc3RhcnRpbmcgd2l0aCAwXG4gIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gIGN0cmwuZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgIG0ucm91dGUoXCIvdXNlcnMvXCIrcm93LmlkKCkpO1xuICB9XG4gIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgbS5yb3V0ZShcIi91c2Vycy9uZXdcIik7XG4gIH1cbiAgY3RybC5kZWxldGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICBjdHJsLnVwZGF0aW5nKHRydWUpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXG4gICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KCk7XG4gICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjdHJsLmN1cnJlbnRwYWdlKCkrMSA+IGZ1bmNzLnBhZ2VzKGN0cmwudm0ubGlzdCgpLmxlbmd0aCwgY3RybC5wYWdlc2l6ZSgpKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY3RybC5jdXJyZW50cGFnZShNYXRoLm1heChjdHJsLmN1cnJlbnRwYWdlKCktMSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7XG4gICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgKTtcbiAgfVxufVxuVXNlcnNDb21wb25lbnQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgdmFyIHNob3dSb3dUZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbSgndHIuY2xpY2thYmxlJywge29uY2xpY2s6IGN0cmwuZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSxcbiAgICAgICAgW1xuICAgICAgICBtKCd0ZCcsIGRhdGEuZW1haWwoKSksXG4gICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEubmFtZSgpKSxcbiAgICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLFtcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5lZGl0LmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXBlbmNpbCcpKSxcbiAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGFuZ2VyW3RpdGxlPdCj0LTQsNC70LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmRlbGV0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1yZW1vdmUnKSlcbiAgICAgICAgXSlcbiAgICAgICAgXVxuICAgICAgICApO1xuICB9IC8vc2hvd1Jvd1RlbXBsYXRlXG5cbiAgLy9jb21wbGV0ZSB2aWV3XG4gIHJldHVybiBtKFwiI3VzZXJsaXN0XCIsIFtcbiAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBzb3J0cyhjdHJsLnZtLmxpc3QoKSksIFtcbiAgICAgICAgICBtKCd0aGVhZCcsIFxuICAgICAgICAgICAgbSgndHInLCBbXG4gICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9ZW1haWxdJywgJ9Ct0LsuINC/0L7Rh9GC0LAnKSxcbiAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9bmFtZV0nLCAn0JjQvNGPJyksXG4gICAgICAgICAgICAgIG0oJ3RoLnNocmluay5hY3Rpb25zJywgJyMnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgKSxcbiAgICAgICAgICBtKCd0Ym9keScsIFxuICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgIC8vaWYgcmVjb3JkIGxpc3QgaXMgcmVhZHksIGVsc2Ugc2hvdyBzcGlubmVyXG4gICAgICAgICAgICA/IFtcbiAgICAgICAgICAgIC8vc2xpY2UgZmlsdGVycyByZWNvcmRzIGZyb20gY3VycmVudCBwYWdlIG9ubHlcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXG4gICAgICAgICAgICAuc2xpY2UoY3RybC5jdXJyZW50cGFnZSgpKmN0cmwucGFnZXNpemUoKSwgKGN0cmwuY3VycmVudHBhZ2UoKSsxKSpjdHJsLnBhZ2VzaXplKCkpXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICByZXR1cm4gc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgKCFjdHJsLnZtLmxpc3QoKS5sZW5ndGgpIFxuICAgICAgICAgICAgPyBtKCd0cicsIG0oJ3RkLnRleHQtY2VudGVyLnRleHQtbXV0ZWRbY29sc3Bhbj00XScsICfQodC/0LjRgdC+0Log0L/Rg9GB0YIsINC90LDQttC80LjRgtC1INCU0L7QsdCw0LLQuNGC0YwsINGH0YLQvtCx0Ysg0YHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQt9Cw0L/QuNGB0YwuJykpXG4gICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICBjdHJsLnVwZGF0aW5nKCkgPyBtLmNvbXBvbmVudChTcGlubmVyKSA6IFwiXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcbiAgICAgICAgICAgKSwgLy90Ym9keVxuICAgICAgICAgIF0pLCAvL3RhYmxlXG4gICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnknLCB7IG9uY2xpY2s6IGN0cmwuY3JlYXRlIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcbiAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgY3RybC52bS5saXN0KCkgPyBtLmNvbXBvbmVudChQYWdpbmF0b3IsIHtsaXN0OiBjdHJsLnZtLmxpc3QsIHBhZ2VzaXplOiBjdHJsLnBhZ2VzaXplLCBjdXJyZW50cGFnZTogY3RybC5jdXJyZW50cGFnZSwgb25zZXRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlfSkgOiBcIlwiLFxuICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVc2Vyc0NvbXBvbmVudDtcbiJdfQ==
