(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Account = undefined;

var _tabs = require("../layout/tabs");

var _manageuser = require("./manageuser");

var _managepassword = require("./managepassword");

var Account = exports.Account = {};
Account.controller = function () {
    var ctrl = this;
    ctrl.title = document.title = "Изменение учетной записи";
};
Account.view = function (ctrl) {
    return m("#account", [m("h1", ctrl.title), m.component(_tabs.Tabs, [{ id: "manageuser", title: "О пользователе", component: _manageuser.ManageUser }, { id: "managepassword", title: "Пароль", component: _managepassword.ManagePassword }])]);
};

},{"../layout/tabs":11,"./managepassword":2,"./manageuser":3}],2:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ManagePassword = undefined;

var _functions = require("../helpers/functions");

var _spinner = require("../layout/spinner");

var Password = function Password(data) {
    data = data || {};
    this.currentpassword = m.prop(data.currentPassword || '');
    this.password = m.prop(data.password || '');
    this.passwordconfirm = m.prop(data.passwordConfirm || '');
    this.meta = m.prop((0, _functions.metadata)(data.meta));
    this.__RequestVerificationToken = m.prop(gettoken());
};

var ManagePassword = exports.ManagePassword = {};
ManagePassword.vm = {};
ManagePassword.vm.init = function () {
    this.record = (0, _functions.mrequest)({ background: true, method: "GET", url: "/api/managepassword", type: Password });
    this.record.then(m.redraw);
    return this;
};
ManagePassword.controller = function () {
    var ctrl = this;
    ctrl.vm = ManagePassword.vm.init();
    ctrl.title = document.title = "Изменить пароль";
    ctrl.message = m.prop(''); //notifications
    ctrl.error = m.prop(''); //request errors
    ctrl.updating = m.prop(false); //request is being processed (show spinner & prevent double click)
    ctrl.onsubmit = function (record) {
        if (ctrl.updating()) return false; // prevent double event processing
        ctrl.message('');
        ctrl.error('');
        ctrl.updating(true);
        m.redraw();
        (0, _functions.mrequest)({ method: "PUT", url: "/api/managepassword", data: record() }).then(function (success) {
            ctrl.updating(false);ctrl.message('Изменения успешно сохранены');
        }, function (error) {
            ctrl.updating(false);ctrl.error("Ошибка! " + (0, _functions.joinErrors)(error));
        });
        return false; //preventDefault
    };
};
ManagePassword.view = function (ctrl) {
    return m("#managepassword", [m("h1", ctrl.title), ctrl.vm.record() ? m('form.animated.fadeIn', [m('.row', [m('.form-group.col-md-4', [(0, _functions.labelfor)('currentpassword', ctrl.vm.record), (0, _functions.inputfor)('currentpassword', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('password', ctrl.vm.record), (0, _functions.inputfor)('password', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('passwordconfirm', ctrl.vm.record), (0, _functions.inputfor)('passwordconfirm', ctrl.vm.record)])]), ctrl.message() ? m('.action-message.animated.fadeInRight', ctrl.message()) : "", ctrl.error() ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "", m('.actions', [m('button.btn.btn-primary[type="submit"]', {
        onclick: ctrl.onsubmit.bind(this, ctrl.vm.record),
        disabled: ctrl.updating()
    }, [ctrl.updating() ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'), m('span', 'Сохранить')])])]) : m.component(_spinner.Spinner, { standalone: true })]);
};

},{"../helpers/functions":5,"../layout/spinner":10}],3:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ManageUser = undefined;

var _functions = require("../helpers/functions");

var _spinner = require("../layout/spinner");

var User = function User(data) {
    data = data || {};
    this.email = m.prop(data.email || '');
    this.firstname = m.prop(data.firstName || '');
    this.lastname = m.prop(data.lastName || '');
    this.middlename = m.prop(data.middleName || '');
    this.birthdate = m.prop(data.birthDate ? data.birthDate.split('T')[0] : '');
    this.country = m.prop(data.country || '');
    this.city = m.prop(data.city || '');
    this.address = m.prop(data.address || '');
    this.zip = m.prop(data.zip || '');
    this.company = m.prop(data.company || '');
    this.position = m.prop(data.position || '');
    this.interests = m.prop(data.interests || '');
    this.meta = m.prop((0, _functions.metadata)(data.meta));
    this.__RequestVerificationToken = m.prop(gettoken());
};

var ManageUser = exports.ManageUser = {};
ManageUser.vm = {};
ManageUser.vm.init = function () {
    this.record = (0, _functions.mrequest)({ background: true, method: "GET", url: "/api/manageuser", type: User });
    this.record.then(m.redraw);
    return this;
};
ManageUser.controller = function () {
    var ctrl = this;
    ctrl.vm = ManageUser.vm.init();
    ctrl.title = document.title = "Данные пользователя";
    ctrl.message = m.prop(''); //notifications
    ctrl.error = m.prop(''); //request errors
    ctrl.updating = m.prop(false); //request is being processed (show spinner & prevent double click)
    ctrl.onsubmit = function (record) {
        if (ctrl.updating()) return false; // prevent double event processing
        ctrl.message('');
        ctrl.error('');
        ctrl.updating(true);
        m.redraw();
        (0, _functions.mrequest)({ method: "PUT", url: "/api/manageuser", data: record() }).then(function (success) {
            ctrl.updating(false);ctrl.message('Изменения успешно сохранены');
        }, function (error) {
            ctrl.updating(false);ctrl.error("Ошибка! " + (0, _functions.joinErrors)(error));
        });
        return false; //preventDefault
    };
};
ManageUser.view = function (ctrl) {
    return m("#manageuser", [m("h1", ctrl.title), ctrl.vm.record() ? m('form.animated.fadeIn', [m('.row', [m('.form-group.col-md-8', [(0, _functions.labelfor)('email', ctrl.vm.record), (0, _functions.inputfor)('email', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('birthdate', ctrl.vm.record), (0, _functions.inputfor)('birthdate', ctrl.vm.record)])]), m('.row', [m('.form-group.col-md-4', [(0, _functions.labelfor)('firstname', ctrl.vm.record), (0, _functions.inputfor)('firstname', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('middlename', ctrl.vm.record), (0, _functions.inputfor)('middlename', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('lastname', ctrl.vm.record), (0, _functions.inputfor)('lastname', ctrl.vm.record)])]), m('.row', [m('.form-group.col-md-4', [(0, _functions.labelfor)('country', ctrl.vm.record), (0, _functions.inputfor)('country', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('city', ctrl.vm.record), (0, _functions.inputfor)('city', ctrl.vm.record)]), m('.form-group.col-md-4', [(0, _functions.labelfor)('zip', ctrl.vm.record), (0, _functions.inputfor)('zip', ctrl.vm.record)])]), m('.form-group', [(0, _functions.labelfor)('address', ctrl.vm.record), (0, _functions.inputfor)('address', ctrl.vm.record)]), m('.row', [m('.form-group.col-md-6', [(0, _functions.labelfor)('company', ctrl.vm.record), (0, _functions.inputfor)('company', ctrl.vm.record)]), m('.form-group.col-md-6', [(0, _functions.labelfor)('position', ctrl.vm.record), (0, _functions.inputfor)('position', ctrl.vm.record)])]), m('.form-group', [(0, _functions.labelfor)('interests', ctrl.vm.record), (0, _functions.inputfor)('interests', ctrl.vm.record)]), ctrl.message() ? m('.action-message.animated.fadeInRight', ctrl.message()) : "", ctrl.error() ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "", m('.actions', [m('button.btn.btn-primary[type="submit"]', {
        onclick: ctrl.onsubmit.bind(this, ctrl.vm.record),
        disabled: ctrl.updating()
    }, [ctrl.updating() ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'), m('span', 'Сохранить')])])]) : m.component(_spinner.Spinner, { standalone: true })]);
};

},{"../helpers/functions":5,"../layout/spinner":10}],4:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
var dashboard = exports.dashboard = {
    controller: function controller() {
        document.title = "Панель администратора";
        return { title: "Dashboard Title $1" };
    },
    view: function view(ctrl) {
        return m("h1", ctrl.title);
    }
};

},{}],5:[function(require,module,exports){
'use strict';

//table metadata

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Meta = function Meta(data) {
    data = data || {};
    var me = this;
    me.name = data.propertyName || "";
    me.displayname = data.displayName || "";
    me.type = data.dataTypeName || "";
    me.isrequired = data.isRequired || false;
    me.isreadonly = data.isReadOnly || false;
    me.placeholder = data.placeholder || "";
};

var config = exports.config = {
    brand: "Каталог ПРО",
    brandAdmin: "Панель администратора"
};

var metadata = exports.metadata = function metadata(meta) {
    var me = [];
    if (meta) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = meta[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var d = _step.value;

                me.push(new Meta(d));
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return me;
};

//name is a string name of property in model
//model - represents table record, should contain 'meta' property with table metadata description
var labelfor = exports.labelfor = function labelfor(name, model) {
    if (model && typeof model == "function" && model().meta) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = model().meta()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var me = _step2.value;

                if (me.name.toLowerCase() === name.toLowerCase()) return m('label', { "for": "#" + name }, me.displayname ? me.displayname : name);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }
    return m('label', { "for": "#" + name }, name);
};

var inputfor = exports.inputfor = function inputfor(name, model) {
    if (model && typeof model == "function" && model().meta) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = model().meta()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var me = _step3.value;

                if (me.name.toLowerCase() === name.toLowerCase()) return m('input.form-control', {
                    id: name,
                    onchange: me.isreadonly ? null : m.withAttr("value", model()[name]),
                    value: model()[name](),
                    disabled: me.isreadonly,
                    required: me.isrequired,
                    type: inputType(me)
                });
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }
    }
    return m('input.form-control', { id: name });
};

var displayfor = exports.displayfor = function displayfor(name, model) {
    if (model && typeof model == "function" && model().meta) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = model().meta()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var me = _step4.value;

                if (me.name.toLowerCase() === name.toLowerCase()) return me.displayname ? me.displayname : name;
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }
    }
    return name;
};

function inputType(me) {
    switch (me.type) {
        case "EmailAddress":
            return "email";
        case "Date":
            return "date";
        case "Password":
            return "password";
        default:
            return '';
    }
}

var parseError = exports.parseError = function parseError(errstr) {
    try {
        return joinErrors(JSON.parse(errstr));
    } catch (err) {
        return errstr; //return as is
    }
};

var joinErrors = exports.joinErrors = function joinErrors(errors) {
    if ((typeof errors === "undefined" ? "undefined" : _typeof(errors)) === "object") {
        var errstr = "";
        for (var key in errors) {
            if (_typeof(errors[key]) === "object") {
                for (var ekey in errors[key]) {
                    errstr += errors[key][ekey] + ". ";
                }
            }
        }
        return errstr;
    } else return errors;
};

var pages = exports.pages = function pages(arlen, pagesize) {
    return Array(Math.floor(arlen / pagesize) + (arlen % pagesize > 0 ? 1 : 0)).fill(0); //return empty array of pages
};

var sorts = exports.sorts = function sorts(list) {
    return {
        onclick: function onclick(e) {
            var prop = e.target.getAttribute("data-sort-by");
            if (prop) {
                var first = list[0];
                list.sort(function (a, b) {
                    return a[prop]() > b[prop]() ? 1 : a[prop]() < b[prop]() ? -1 : 0;
                });
                if (first === list[0]) list.reverse();
            }
        }
    };
};

var mrequest = exports.mrequest = function mrequest(args) {
    var nonJsonErrors = function nonJsonErrors(xhr) {
        return xhr.status > 204 && xhr.responseText.length ? JSON.stringify(xhr.responseText) : xhr.responseText.length ? xhr.responseText : null;
    };
    args.extract = nonJsonErrors;
    return m.request(args);
};

var setCookie = exports.setCookie = function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

var getCookie = exports.getCookie = function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Model = undefined;

var _functions = require("./functions");

//args: {url: "/api/example", type: ObjectType}
var Model = exports.Model = function Model(args) {
    args = args || {};
    var model = this;

    model.index = function () {
        return (0, _functions.mrequest)({
            background: true,
            method: "GET",
            url: args.url,
            type: args.type
        });
    };
    model.get = function (id) {
        return (0, _functions.mrequest)({
            background: true,
            method: "GET",
            url: args.url + "/" + id,
            type: args.type
        });
    };
    model.create = function (data) {
        return (0, _functions.mrequest)({
            background: true,
            method: "POST",
            url: args.url,
            data: data
        });
    };
    model.update = function (data) {
        return (0, _functions.mrequest)({
            background: true,
            method: "PUT",
            url: args.url,
            data: data
        });
    };
    model.delete = function (id) {
        return (0, _functions.mrequest)({
            background: true,
            method: "DELETE",
            url: args.url + "/" + id
        });
    };
};

},{"./functions":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.withLayout = withLayout;

var _functions = require('../helpers/functions');

function layout(component) {
    function logout() {
        m.request({
            method: "POST",
            url: "/api/logOff"
        }).then(function (success) {
            window.location = "/";
        });
    }

    var header = m("nav.navbar.navbar-default", [m('.container-fluid', [m('.navbar-header', [m('button.navbar-toggle.collapsed[type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false"]', [m('span.sr-only', "Toggle navigation"), m('span.icon-bar'), m('span.icon-bar'), m('span.icon-bar')]), m('a.navbar-brand[href="#"]', _functions.config.brandAdmin)]), m('.collapse navbar-collapse#navbar-collapse', [m('ul.nav.navbar-nav.navbar-right', [m('li', m('a[href="/"]', [m('i.fa.fa-play'), m('span', "Сайт")])), m('li', m('a[href="#"]', { onclick: logout }, [m('i.fa.fa-sign-out'), m('span', "Выйти")]))])])])]);

    var navlink = function navlink(url, title) {
        return m('li', { class: m.route().includes(url) ? "active" : "" }, m('a', { href: url, config: m.route }, title));
    };
    var sidebar = [m('.panel.panel-default', [m('ul.nav nav-pills nav-stacked', [navlink("/categories", "Категории товаров"), navlink("/products", "Товары"), navlink("/account", "Учетная запись")])])];

    var footer = [m('footer#footer', [m('.container', [m('div', "Подвал сайта")])])];
    return [header, m("#content-wrapper.container", [m('#sidebar', sidebar), m('#content', m.component(component))]), footer];
};

function mixinLayout(layout, component) {
    return function () {
        return layout(component);
    };
};

function withLayout(component) {
    return { controller: function controller() {}, view: mixinLayout(layout, component) };
}

},{"../helpers/functions":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PageSizeSelector = undefined;

var _functions = require("../helpers/functions");

var PageSizeSelector = exports.PageSizeSelector = {};

//arg is an m.prop of pagesize in the parent controller
PageSizeSelector.controller = function (arg) {
    var ctrl = this;
    ctrl.setpagesize = function (size) {
        arg(size);
        (0, _functions.setCookie)("pagesize", size, 365); //store pagesize in cookies
        m.redraw();
        return false;
    };
};

PageSizeSelector.view = function (ctrl, arg) {
    return m('#pagesizeselector', [m('span', "Показывать на странице: "), [10, 50, 100, 500].map(function (size) {
        return m('a[href=#]', { class: size == arg() ? 'active' : '', onclick: ctrl.setpagesize.bind(this, size) }, size);
    })]);
};

},{"../helpers/functions":5}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Paginator = undefined;

var _functions = require('../helpers/functions');

var Paginator = exports.Paginator = {};

Paginator.controller = function (args) {
    var ctrl = this;
    ctrl.setpage = function (index) {
        args.onsetpage(index);
        return false;
    };
};

Paginator.view = function (ctrl, args) {
    return m('#paginator', args.list().length > args.pagesize() ? m('nav', [m('ul.pagination', (0, _functions.pages)(args.list().length, args.pagesize()).map(function (p, index) {
        return m('li', { class: index == args.currentpage() ? 'active' : '' }, index == args.currentpage() ? m('span', index + 1) : m('a[href=/]', { onclick: ctrl.setpage.bind(this, index) }, index + 1));
    }))]) : "");
};

},{"../helpers/functions":5}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var LoadingSpinner = {};

LoadingSpinner.controller = function () {};
LoadingSpinner.view = function (ctrl) {
    return m('#loading-spinner.animated.fadeIn', [m('p.text-center', m('i.fa.fa-spin.fa-cog.fa-3x')), m('p.text-center', 'Подождите, идет загрузка...')]);
};

var UpdatingSpinner = {};

UpdatingSpinner.controller = function (args) {};
UpdatingSpinner.view = function (ctrl, args) {
    return m('#updating-spinner.animated.fadeIn', [m('p#spinner-text', m('i.fa.fa-spin.fa-cog.fa-3x'))]);
};

var Spinner = exports.Spinner = {};
Spinner.controller = function (args) {
    var ctrl = this;
    ctrl.standalone = args && args.standalone ? true : false;
};
Spinner.view = function (ctrl, args) {
    return m('#spinner', ctrl.standalone ? m.component(LoadingSpinner) : m.component(UpdatingSpinner));
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Tabs = exports.Tabs = {};

//args is an array of objects {id: "tab id", title: "tab title", component: "component to be rendered in that tab"}
Tabs.controller = function (args) {
    var ctrl = this;
    ctrl.active = m.prop(args[0].id);
    ctrl.setactive = function (id) {
        ctrl.active(id);
    };
};

Tabs.view = function (ctrl, args) {
    return m('.tabs', [m('ul.nav.nav-tabs[role="tablist"]', args.map(function (data) {
        return m('li[role="presentation"]', { class: ctrl.active() == data.id ? "active" : "" }, m('a', {
            id: data.id,
            "aria-controls": data.id,
            role: "tab",
            "data-toggle": "tab",
            href: "#" + data.id,
            onclick: ctrl.setactive.bind(this, data.id)
        }, data.title));
    })), m('.tab-content', args.map(function (data) {
        return ctrl.active() == data.id ? m('.tab-pane.active[role="tabpanel"]', { id: data.id }, m.component(data.component)) : "";
    }))]);
};

},{}],12:[function(require,module,exports){
'use strict';
/*global m */

var _dashboard = require("./dashboard");

var _categorygrid = require("./product/categorygrid");

var _productlist = require("./product/productlist");

var _product = require("./product/product");

var _account = require("./account/account");

var _layout = require("./layout/layout");

//setup routes to start w/ the `#` symbol
m.route.mode = "hash";

m.route(document.getElementById("admin-app"), "/", {
    "/": (0, _layout.withLayout)(_dashboard.dashboard),
    "/account": (0, _layout.withLayout)(_account.Account),
    "/categories": (0, _layout.withLayout)(_categorygrid.CategoryGrid),
    "/products": (0, _layout.withLayout)(_productlist.ProductList),
    "/products/:id": (0, _layout.withLayout)(_product.ProductPage)
});

},{"./account/account":1,"./dashboard":4,"./layout/layout":7,"./product/categorygrid":13,"./product/product":15,"./product/productlist":16}],13:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CategoryGrid = exports.Category = undefined;

var _functions = require("../helpers/functions");

var _model = require("../helpers/model");

var _spinner = require("../layout/spinner");

var _pagesizeselector = require("../layout/pagesizeselector");

var _paginator = require("../layout/paginator");

var Category = exports.Category = function Category(data) {
    data = data || {};
    this.id = m.prop(data.id || 0);
    this.name = m.prop(data.name || '');
    this.ispublished = m.prop(data.isPublished || false);
    this.__RequestVerificationToken = m.prop(gettoken());
};var CategoryGrid = exports.CategoryGrid = {};
CategoryGrid.vm = {};
CategoryGrid.vm.init = function (args) {
    args = args || {};
    var vm = this;
    vm.model = new _model.Model({ url: "/api/categories", type: Category });
    vm.list = vm.model.index();
    return this;
};
CategoryGrid.controller = function () {
    var ctrl = this;

    ctrl.vm = CategoryGrid.vm.init();
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.list.then(function () {
        ctrl.updating(false);m.redraw();
    }); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Категории товаров";
    ctrl.editingid = m.prop(''); //id of the row, that is being edited
    ctrl.record = m.prop(''); //temporary state of the row, that is being edited
    ctrl.pagesize = m.prop((0, _functions.getCookie)("pagesize") || 10); //number of items per page
    ctrl.currentpage = m.prop(0); //current page, starting with 0
    ctrl.error = m.prop('');

    ctrl.startedit = function (row) {
        ctrl.editingid(row.id());
        ctrl.record = new Category({ id: row.id(), isPublished: row.ispublished(), name: row.name() });
    };
    ctrl.update = function (row) {
        ctrl.updating(true);
        m.redraw();
        ctrl.vm.model.update(ctrl.record).then(function (success) {
            ctrl.editingid('');
            ctrl.vm.list()[ctrl.vm.list().indexOf(row)] = ctrl.record; //update current row in grid
        }, function (error) {
            return ctrl.error((0, _functions.parseError)(error));
        }).then(function () {
            ctrl.updating(false);m.redraw();
        });
    };
    ctrl.startcreate = function () {
        ctrl.editingid('new');
        ctrl.record = new Category({ id: 0, isPublished: true, name: '' });
    };
    ctrl.create = function () {
        ctrl.updating(true);
        m.redraw();
        ctrl.vm.model.create(ctrl.record).then(function (success) {
            ctrl.vm.list = ctrl.vm.model.index();
            ctrl.vm.list.then(function () {
                ctrl.editingid('');
                ctrl.updating(false);
                m.redraw();
            });
        }, function (error) {
            ctrl.error((0, _functions.parseError)(error));
            ctrl.updating(false);
            m.redraw();
        });
    };
    ctrl.delete = function (row) {
        ctrl.updating(true);
        event.stopPropagation(); //prevent tr.onclick trigger
        ctrl.vm.model.delete(row.id()).then(function (success) {
            ctrl.vm.list = ctrl.vm.model.index();
            ctrl.vm.list.then(function () {
                if (ctrl.currentpage() + 1 > (0, _functions.pages)(ctrl.vm.list().length, ctrl.pagesize()).length) {
                    ctrl.currentpage(Math.max(ctrl.currentpage() - 1, 0));
                }
                ctrl.updating(false);
                m.redraw();
            });
        }, function (error) {
            ctrl.updating(false);
            m.redraw();
        });
    };
    ctrl.canceledit = function () {
        ctrl.editingid('');
    };
};
CategoryGrid.view = function (ctrl) {

    var editRowTemplate = function editRowTemplate(data) {
        return [m('tr', {
            config: function config(el, init) {
                if (!init) {
                    el.onkeyup = function (e) {
                        if (e.keyCode == 13) ctrl.update(data);
                        if (e.keyCode == 27) {
                            ctrl.canceledit();m.redraw();
                        }
                    };
                }
            }
        }, [m('td.shrink', ctrl.record.id()), m('td', m('input.form-control', {
            config: function config(el, init) {
                if (!init) el.focus();
            },
            value: ctrl.record.name(),
            onchange: m.withAttr("value", ctrl.record.name)
        })), m('td.shrink', m('input[type=checkbox]', { checked: ctrl.record.ispublished(), onclick: m.withAttr("checked", ctrl.record.ispublished) })), m('td.shrink.actions', [m('button.btn.btn-sm.btn-default[title=Сохранить]', { onclick: ctrl.update.bind(this, data) }, m('i.fa.fa-check')), m('button.btn.btn-sm.btn-default[title=Отмена]', { onclick: ctrl.canceledit }, m('i.fa.fa-times'))])]), //tr
        ctrl.error() ? m('tr.error.animated.fadeIn', [m('td'), m('td.text-danger[colspan=2]', ctrl.error()), m('td')]) : ""];
    }; //editRowTemplate

    var showRowTemplate = function showRowTemplate(data) {
        return m('tr.clickable', { onclick: ctrl.startedit.bind(this, data) }, [m('td.shrink', data.id()), m('td', data.name()), m('td.shrink.text-center', data.ispublished() ? m('i.fa.fa-check') : m('i.fa.fa-times')), m('td.shrink.actions', [m('button.btn.btn-sm.btn-default[title=Редактировать]', { onclick: ctrl.startedit.bind(this, data) }, m('i.fa.fa-pencil')), m('button.btn.btn-sm.btn-danger[title=Удалить]', { onclick: ctrl.delete.bind(this, data) }, m('i.fa.fa-remove'))])]);
    }; //showRowTemplate

    var createTemplate = function createTemplate(data) {
        return [m('tr', {
            config: function config(el, init) {
                if (!init) {
                    el.onkeyup = function (e) {
                        if (e.keyCode == 13) ctrl.create();
                        if (e.keyCode == 27) {
                            ctrl.canceledit();m.redraw();return;
                        }
                    };
                }
            }
        }, [m('td.shrink'), m('td', m('input.form-control', {
            config: function config(el, init) {
                if (!init) el.focus();
            },
            value: ctrl.record.name(),
            onchange: m.withAttr("value", ctrl.record.name)
        })), m('td.shrink', m('input[type=checkbox]', { checked: ctrl.record.ispublished(), onclick: m.withAttr("checked", ctrl.record.ispublished) })), m('td.shrink.actions', [m('button.btn.btn-sm.btn-default[title=Создать]', { onclick: ctrl.create }, m('i.fa.fa-check')), m('button.btn.btn-sm.btn-default[title=Отмена]', { onclick: ctrl.canceledit }, m('i.fa.fa-times'))])]), //tr
        ctrl.error() ? m('tr.error.animated.fadeIn', [m('td'), m('td.text-danger[colspan=2]', ctrl.error()), m('td')]) : ""];
    }; //createTemplate

    //complete view
    return m("#categorylist", [m("h1", ctrl.title), m('div', [m('table.table.table-striped.animated.fadeIn', (0, _functions.sorts)(ctrl.vm.list()), [m('thead', m('tr', [m('th.shrink.clickable[data-sort-by=id]', '№'), m('th.clickable[data-sort-by=name]', 'Название'), m('th.shrink.clickable[data-sort-by=ispublished]', 'Опубликована'), m('th.shrink.actions', '#')])), m('tbody', ctrl.vm.list()
    //if record list is ready, else show spinner
    ? [
    //slice filters records from current page only
    ctrl.vm.list().slice(ctrl.currentpage() * ctrl.pagesize(), (ctrl.currentpage() + 1) * ctrl.pagesize()).map(function (data) {
        return ctrl.editingid() == data.id() ? editRowTemplate(data) : showRowTemplate(data);
    }), !ctrl.vm.list().length ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.')) : "", ctrl.editingid() == "new" ? createTemplate() : "", ctrl.updating() ? m.component(_spinner.Spinner) : ""] : m.component(_spinner.Spinner))]), //table
    m('.actions', [m('button.btn.btn-primary', { onclick: ctrl.startcreate }, [m('i.fa.fa-plus'), m('span', 'Добавить категорию')]), m('.pull-right', m.component(_pagesizeselector.PageSizeSelector, ctrl.pagesize))]), ctrl.vm.list() ? m.component(_paginator.Paginator, { list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage }) : ""])]);
};

},{"../helpers/functions":5,"../helpers/model":6,"../layout/pagesizeselector":8,"../layout/paginator":9,"../layout/spinner":10}],14:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CategorySelect = undefined;

var _functions = require("../helpers/functions");

var _model = require("../helpers/model");

var _spinner = require("../layout/spinner");

var _pagesizeselector = require("../layout/pagesizeselector");

var _paginator = require("../layout/paginator");

var _categorygrid = require("./categorygrid");

var CategorySelect = exports.CategorySelect = {};
CategorySelect.vm = {};
CategorySelect.vm.init = function (args) {
    args = args || {};
    var vm = this;
    vm.list = (0, _functions.mrequest)({ method: "GET", url: "/api/categories", type: _categorygrid.Category });
    return this;
};

//args: {value: m.prop, error: m.prop optional}
CategorySelect.controller = function (args) {
    args = args || {};
    var ctrl = this;
    ctrl.value = args.value;
    ctrl.vm = CategorySelect.vm.init();
    ctrl.vm.list.then(function (data) {
        if (data.length) ctrl.value(data[0].id());
    }); //initial value
    ctrl.error = args.error || m.prop('');
};
CategorySelect.view = function (ctrl, args) {
    return m("select.form-control", {
        onchange: m.withAttr("value", ctrl.value)
    }, ctrl.vm.list() ? ctrl.vm.list().map(function (data) {
        return m('option', { value: data.id() }, data.name());
    }) : "");
};

},{"../helpers/functions":5,"../helpers/model":6,"../layout/pagesizeselector":8,"../layout/paginator":9,"../layout/spinner":10,"./categorygrid":13}],15:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ProductPage = exports.Product = undefined;

var _functions = require("../helpers/functions");

var _model = require("../helpers/model");

var _spinner = require("../layout/spinner");

var _pagesizeselector = require("../layout/pagesizeselector");

var _paginator = require("../layout/paginator");

var _categorygrid = require("./categorygrid");

var _categoryselect = require("./categoryselect");

var Product = exports.Product = function Product(data) {
    data = data || {};
    this.id = m.prop(data.id || 0);
    this.name = m.prop(data.name || '');
    this.ispublished = m.prop(data.isPublished || false);
    this.categoryname = m.prop(data.categoryName || '');
    this.categoryid = m.prop(data.categoryId || 0);
    this.description = m.prop(data.description || '');
    this.image = m.prop(data.image || '');
    this.price = m.prop(data.price || null);
    this.meta = m.prop((0, _functions.metadata)(data.meta));
    this.__RequestVerificationToken = m.prop(gettoken());
};var ProductPage = exports.ProductPage = {};
ProductPage.vm = {};
ProductPage.vm.init = function () {
    var vm = this;
    vm.model = new _model.Model({ url: "/api/products", type: Product });
    vm.record = vm.model.get(m.route.param("id"));
    return this;
};
ProductPage.controller = function () {
    var ctrl = this;

    ctrl.vm = ProductPage.vm.init();
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.record.then(function () {
        ctrl.updating(false);m.redraw();
    }); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = m.route.param("id") == "new" ? "Создание нового товара" : "Карточка товара";
    ctrl.error = m.prop('');
    ctrl.message = m.prop(''); //notifications

    ctrl.update = function () {
        ctrl.updating(true);
        m.redraw();
        ctrl.vm.model.update(ctrl.vm.record).then(function (success) {
            return ctrl.message('Изменения успешно сохранены');
        }, function (error) {
            return ctrl.error((0, _functions.parseError)(error));
        }).then(function () {
            ctrl.updating(false);m.redraw();
        });
    };
    ctrl.create = function () {
        ctrl.updating(true);
        m.redraw();
        ctrl.vm.model.create(ctrl.vm.record).then(function (success) {
            return m.route("/products");
        }, function (error) {
            ctrl.error((0, _functions.parseError)(error));
            ctrl.updating(false);
            m.redraw();
        });
    };
    ctrl.delete = function () {
        ctrl.updating(true);
        ctrl.vm.model.delete(ctrl.vm.record.id()).then(function (success) {
            return m.route("/products");
        }, function (error) {
            ctrl.error((0, _functions.parseError)(error));
            ctrl.updating(false);
            m.redraw();
        });
    };
};
ProductPage.view = function (ctrl) {

    //complete view
    return m("#categorylist", [m("h1", ctrl.title), ctrl.vm.record() ? m('form.animated.fadeIn', [m('.form-group', [(0, _functions.labelfor)('name', ctrl.vm.record), (0, _functions.inputfor)('name', ctrl.vm.record)]), m('.form-group', [(0, _functions.labelfor)('image', ctrl.vm.record), (0, _functions.inputfor)('image', ctrl.vm.record) //filefor
    ]), m('.form-group', [(0, _functions.labelfor)('categoryid', ctrl.vm.record), m.component(_categoryselect.CategorySelect, { value: ctrl.vm.record().categoryid, error: ctrl.error })]), m('.form-group', [(0, _functions.labelfor)('ispublished', ctrl.vm.record), (0, _functions.inputfor)('ispublished', ctrl.vm.record) //checkboxfor
    ]), m('.form-group', [(0, _functions.labelfor)('price', ctrl.vm.record), (0, _functions.inputfor)('price', ctrl.vm.record)]), m('.form-group', [(0, _functions.labelfor)('description', ctrl.vm.record), (0, _functions.inputfor)('description', ctrl.vm.record) //textareafor
    ]), ctrl.message() ? m('.action-message.animated.fadeInRight', ctrl.message()) : "", ctrl.error() ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "", m('.actions', [m.route.param("id") == "new" ? m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.create, disabled: ctrl.updating() }, [ctrl.updating() ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'), m('span', 'Создать')]) : [m('button.btn.btn-primary[type="submit"]', { onclick: ctrl.update, disabled: ctrl.updating() }, [ctrl.updating() ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'), m('span', 'Сохранить')]), m('button.btn.btn-danger', { onclick: ctrl.delete, disabled: ctrl.updating() }, [m('i.fa.fa-remove'), m('span', 'Удалить')])]])]) : m.component(_spinner.Spinner, { standalone: true })]);
};

},{"../helpers/functions":5,"../helpers/model":6,"../layout/pagesizeselector":8,"../layout/paginator":9,"../layout/spinner":10,"./categorygrid":13,"./categoryselect":14}],16:[function(require,module,exports){
'use strict';
/*global m */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ProductList = undefined;

var _functions = require("../helpers/functions");

var _model = require("../helpers/model");

var _spinner = require("../layout/spinner");

var _pagesizeselector = require("../layout/pagesizeselector");

var _paginator = require("../layout/paginator");

var _product = require("./product");

var ProductList = exports.ProductList = {};
ProductList.vm = {};
ProductList.vm.init = function (args) {
    args = args || {};
    var vm = this;
    vm.model = new _model.Model({ url: "/api/products", type: _product.Product });
    vm.list = vm.model.index();
    return this;
};
ProductList.controller = function () {
    var ctrl = this;

    ctrl.vm = ProductList.vm.init();
    ctrl.updating = m.prop(true); //waiting for data update in background
    ctrl.vm.list.then(function () {
        ctrl.updating(false);m.redraw();
    }); //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Список товаров";
    ctrl.pagesize = m.prop((0, _functions.getCookie)("pagesize") || 10); //number of items per page
    ctrl.currentpage = m.prop(0); //current page, starting with 0
    ctrl.error = m.prop('');

    ctrl.startedit = function (row) {
        console.log('Use m.route to redirect');
    };
    ctrl.startcreate = function (row) {
        m.route("/products/new");
    };
    ctrl.delete = function (row) {
        ctrl.updating(true);
        event.stopPropagation(); //prevent tr.onclick trigger
        ctrl.vm.model.delete(row.id()).then(function (success) {
            ctrl.vm.list = ctrl.vm.model.index();
            ctrl.vm.list.then(function () {
                if (ctrl.currentpage() + 1 > (0, _functions.pages)(ctrl.vm.list().length, ctrl.pagesize()).length) {
                    ctrl.currentpage(Math.max(ctrl.currentpage() - 1, 0));
                }
                ctrl.updating(false);
                m.redraw();
            });
        }, function (error) {
            ctrl.updating(false);
            m.redraw();
        });
    };
};
ProductList.view = function (ctrl) {

    var showRowTemplate = function showRowTemplate(data) {
        return m('tr.clickable', { onclick: ctrl.startedit.bind(this, data) }, [m('td.shrink', data.id()), m('td.shrink', data.image() ? m('img.image-preview.img-responsive', { src: data.image() }) : ""), m('td', data.name()), m('td.shrink', data.categoryname()), m('td.shrink.text-center', data.ispublished() ? m('i.fa.fa-check') : m('i.fa.fa-times')), m('td.shrink.actions', [m('button.btn.btn-sm.btn-default[title=Редактировать]', { onclick: ctrl.startedit.bind(this, data) }, m('i.fa.fa-pencil')), m('button.btn.btn-sm.btn-danger[title=Удалить]', { onclick: ctrl.delete.bind(this, data) }, m('i.fa.fa-remove'))])]);
    }; //showRowTemplate

    //complete view
    return m("#productlist", [m("h1", ctrl.title), m('div', [m('table.table.table-striped.animated.fadeIn', (0, _functions.sorts)(ctrl.vm.list()), [m('thead', m('tr', [m('th.shrink.clickable[data-sort-by=id]', '№'), m('th.clickable[data-sort-by=image]', 'Фото'), m('th.clickable[data-sort-by=name]', 'Название'), m('th.clickable[data-sort-by=categoryname]', 'Категория'), m('th.shrink.clickable[data-sort-by=ispublished]', 'Опубликована'), m('th.shrink.actions', '#')])), m('tbody', ctrl.vm.list()
    //if record list is ready, else show spinner
    ? [
    //slice filters records from current page only
    ctrl.vm.list().slice(ctrl.currentpage() * ctrl.pagesize(), (ctrl.currentpage() + 1) * ctrl.pagesize()).map(function (data) {
        return showRowTemplate(data);
    }), !ctrl.vm.list().length ? m('tr', m('td.text-center.text-muted[colspan=4]', 'Список пуст, нажмите Добавить, чтобы создать новую запись.')) : "", ctrl.updating() ? m.component(_spinner.Spinner) : ""] : m.component(_spinner.Spinner))]), //table
    m('.actions', [m('button.btn.btn-primary', { onclick: ctrl.startcreate }, [m('i.fa.fa-plus'), m('span', 'Добавить товар')]), m('.pull-right', m.component(_pagesizeselector.PageSizeSelector, ctrl.pagesize))]), ctrl.vm.list() ? m.component(_paginator.Paginator, { list: ctrl.vm.list, pagesize: ctrl.pagesize, currentpage: ctrl.currentpage, onsetpage: ctrl.currentpage }) : ""])]);
};

},{"../helpers/functions":5,"../helpers/model":6,"../layout/pagesizeselector":8,"../layout/paginator":9,"../layout/spinner":10,"./product":15}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHNcXGpzXFxhY2NvdW50XFxhY2NvdW50LmpzIiwiYXNzZXRzXFxqc1xcYWNjb3VudFxcbWFuYWdlcGFzc3dvcmQuanMiLCJhc3NldHNcXGpzXFxhY2NvdW50XFxtYW5hZ2V1c2VyLmpzIiwiYXNzZXRzXFxqc1xcZGFzaGJvYXJkLmpzIiwiYXNzZXRzXFxqc1xcaGVscGVyc1xcZnVuY3Rpb25zLmpzIiwiYXNzZXRzXFxqc1xcaGVscGVyc1xcbW9kZWwuanMiLCJhc3NldHNcXGpzXFxsYXlvdXRcXGxheW91dC5qcyIsImFzc2V0c1xcanNcXGxheW91dFxccGFnZXNpemVzZWxlY3Rvci5qcyIsImFzc2V0c1xcanNcXGxheW91dFxccGFnaW5hdG9yLmpzIiwiYXNzZXRzXFxqc1xcbGF5b3V0XFxzcGlubmVyLmpzIiwiYXNzZXRzXFxqc1xcbGF5b3V0XFx0YWJzLmpzIiwiYXNzZXRzXFxqc1xcbWFpbi5qcyIsImFzc2V0c1xcanNcXHByb2R1Y3RcXGNhdGVnb3J5Z3JpZC5qcyIsImFzc2V0c1xcanNcXHByb2R1Y3RcXGNhdGVnb3J5c2VsZWN0LmpzIiwiYXNzZXRzXFxqc1xccHJvZHVjdFxccHJvZHVjdC5qcyIsImFzc2V0c1xcanNcXHByb2R1Y3RcXHByb2R1Y3RsaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUM7QUFDRDs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUVPLElBQUksNEJBQVUsRUFBZDtBQUNQLFFBQVEsVUFBUixHQUFxQixZQUFZO0FBQzdCLFFBQUksT0FBTyxJQUFYO0FBQ0EsU0FBSyxLQUFMLEdBQWEsU0FBUyxLQUFULEdBQWlCLDBCQUE5QjtBQUNILENBSEQ7QUFJQSxRQUFRLElBQVIsR0FBZSxVQUFVLElBQVYsRUFBZ0I7QUFDM0IsV0FBTyxFQUFFLFVBQUYsRUFBYyxDQUNqQixFQUFFLElBQUYsRUFBUSxLQUFLLEtBQWIsQ0FEaUIs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R0FFRSxFQVZKLEVBV0UsS0FBSyxRQUFMLEtBQWtCLEVBQUUsU0FBRixrQkFBbEIsR0FBeUMsRUFYM0MsQ0FGRixHQWVGLEVBQUUsU0FBRixrQkFoQkYsQ0FYa0UsQ0FBdEUsQ0FESyxFQThCRDtBQUNKLE1BQUUsVUFBRixFQUFjLENBQ1YsRUFBRSx3QkFBRixFQUE0QixFQUFFLFNBQVMsS0FBSyxXQUFoQixFQUE1QixFQUEyRCxDQUN2RCxFQUFFLGNBQUYsQ0FEdUQsRUFFdkQsRUFBRSxNQUFGLEVBQVUsZ0JBQVYsQ0FGdUQsQ0FBM0QsQ0FEVSxFQUtWLEVBQUUsYUFBRixFQUFpQixFQUFFLFNBQUYscUNBQThCLEtBQUssUUFBbkMsQ0FBakIsQ0FMVSxDQUFkLENBL0JLLEVBc0NMLEtBQUssRUFBTCxDQUFRLElBQVIsS0FBaUIsRUFBRSxTQUFGLHVCQUF1QixFQUFDLE1BQU0sS0FBSyxFQUFMLENBQVEsSUFBZixFQUFxQixVQUFVLEtBQUssUUFBcEMsRUFBOEMsYUFBYSxLQUFLLFdBQWhFLEVBQTZFLFdBQVcsS0FBSyxXQUE3RixFQUF2QixDQUFqQixHQUFxSixFQXRDaEosQ0FBVCxDQUZxQixDQUFsQixDQUFQO0FBMkNILENBOUREIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7vyd1c2Ugc3RyaWN0JztcclxuLypnbG9iYWwgbSAqL1xyXG5pbXBvcnQge1RhYnN9IGZyb20gXCIuLi9sYXlvdXQvdGFic1wiXHJcbmltcG9ydCB7TWFuYWdlVXNlcn0gZnJvbSBcIi4vbWFuYWdldXNlclwiXHJcbmltcG9ydCB7TWFuYWdlUGFzc3dvcmR9IGZyb20gXCIuL21hbmFnZXBhc3N3b3JkXCJcclxuXHJcbmV4cG9ydCB2YXIgQWNjb3VudCA9IHt9XHJcbkFjY291bnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjdHJsID0gdGhpc1xyXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmNC30LzQtdC90LXQvdC40LUg0YPRh9C10YLQvdC+0Lkg0LfQsNC/0LjRgdC4XCJcclxufVxyXG5BY2NvdW50LnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xyXG4gICAgcmV0dXJuIG0oXCIjYWNjb3VudFwiLCBbXHJcbiAgICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxyXG4gICAgICAgIG0uY29tcG9uZW50KFRhYnMsIFtcclxuICAgICAgICAgICAge2lkOiBcIm1hbmFnZXVzZXJcIiwgdGl0bGU6IFwi0J4g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C1XCIsIGNvbXBvbmVudDogTWFuYWdlVXNlcn0sXHJcbiAgICAgICAgICAgIHtpZDogXCJtYW5hZ2VwYXNzd29yZFwiLCB0aXRsZTogXCLQn9Cw0YDQvtC70YxcIiwgY29tcG9uZW50OiBNYW5hZ2VQYXNzd29yZH1cclxuICAgICAgICBdKVxyXG4gICAgXSlcclxufVxyXG4iLCLvu78ndXNlIHN0cmljdCc7XHJcbi8qZ2xvYmFsIG0gKi9cclxuaW1wb3J0IHttcmVxdWVzdCwgbWV0YWRhdGEsIGxhYmVsZm9yLCBpbnB1dGZvciwgam9pbkVycm9yc30gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcclxuaW1wb3J0IHtTcGlubmVyfSBmcm9tIFwiLi4vbGF5b3V0L3NwaW5uZXJcIlxyXG5cclxudmFyIFBhc3N3b3JkID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBkYXRhID0gZGF0YSB8fCB7fVxyXG4gICAgdGhpcy5jdXJyZW50cGFzc3dvcmQgPSBtLnByb3AoZGF0YS5jdXJyZW50UGFzc3dvcmR8fCAnJylcclxuICAgIHRoaXMucGFzc3dvcmQgPSBtLnByb3AoZGF0YS5wYXNzd29yZHx8ICcnKVxyXG4gICAgdGhpcy5wYXNzd29yZGNvbmZpcm0gPSBtLnByb3AoZGF0YS5wYXNzd29yZENvbmZpcm0gfHwgJycpXHJcbiAgICB0aGlzLm1ldGEgPSBtLnByb3AobWV0YWRhdGEoZGF0YS5tZXRhKSlcclxuICAgIHRoaXMuX19SZXF1ZXN0VmVyaWZpY2F0aW9uVG9rZW4gPSBtLnByb3AoZ2V0dG9rZW4oKSlcclxufVxyXG5cclxuZXhwb3J0IHZhciBNYW5hZ2VQYXNzd29yZCA9IHt9XHJcbk1hbmFnZVBhc3N3b3JkLnZtID0ge31cclxuTWFuYWdlUGFzc3dvcmQudm0uaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yZWNvcmQgPSBtcmVxdWVzdCh7IGJhY2tncm91bmQ6IHRydWUsIG1ldGhvZDogXCJHRVRcIiwgdXJsOiBcIi9hcGkvbWFuYWdlcGFzc3dvcmRcIiwgdHlwZTogUGFzc3dvcmQgfSlcclxuICAgIHRoaXMucmVjb3JkLnRoZW4obS5yZWRyYXcpXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcbk1hbmFnZVBhc3N3b3JkLmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXNcclxuICAgIGN0cmwudm0gPSBNYW5hZ2VQYXNzd29yZC52bS5pbml0KClcclxuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0JjQt9C80LXQvdC40YLRjCDQv9Cw0YDQvtC70YxcIlxyXG4gICAgY3RybC5tZXNzYWdlID0gbS5wcm9wKCcnKSAvL25vdGlmaWNhdGlvbnNcclxuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpIC8vcmVxdWVzdCBlcnJvcnNcclxuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AoZmFsc2UpIC8vcmVxdWVzdCBpcyBiZWluZyBwcm9jZXNzZWQgKHNob3cgc3Bpbm5lciAmIHByZXZlbnQgZG91YmxlIGNsaWNrKVxyXG4gICAgY3RybC5vbnN1Ym1pdCA9IGZ1bmN0aW9uKHJlY29yZCkge1xyXG4gICAgICAgIGlmIChjdHJsLnVwZGF0aW5nKCkpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSAvLyBwcmV2ZW50IGRvdWJsZSBldmVudCBwcm9jZXNzaW5nXHJcbiAgICAgICAgY3RybC5tZXNzYWdlKCcnKVxyXG4gICAgICAgIGN0cmwuZXJyb3IoJycpXHJcbiAgICAgICAgY3RybC51cGRhdGluZyh0cnVlKVxyXG4gICAgICAgIG0ucmVkcmF3KClcclxuICAgICAgICBtcmVxdWVzdCh7IG1ldGhvZDogXCJQVVRcIiwgdXJsOiBcIi9hcGkvbWFuYWdlcGFzc3dvcmRcIiwgZGF0YTogcmVjb3JkKCkgfSkudGhlbihcclxuICAgICAgICAgICAgKHN1Y2Nlc3MpID0+IHsgY3RybC51cGRhdGluZyhmYWxzZSk7IGN0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpIH0sXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4geyBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgY3RybC5lcnJvcihcItCe0YjQuNCx0LrQsCEgXCIgKyBqb2luRXJyb3JzKGVycm9yKSkgfVxyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm4gZmFsc2UgLy9wcmV2ZW50RGVmYXVsdFxyXG4gICAgfVxyXG59XHJcbk1hbmFnZVBhc3N3b3JkLnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xyXG4gICAgcmV0dXJuIG0oXCIjbWFuYWdlcGFzc3dvcmRcIiwgW1xyXG4gICAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcclxuICAgICAgICBjdHJsLnZtLnJlY29yZCgpIFxyXG4gICAgICAgID8gbSgnZm9ybS5hbmltYXRlZC5mYWRlSW4nLCBbXHJcbiAgICAgICAgICAgIG0oJy5yb3cnLCBbXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignY3VycmVudHBhc3N3b3JkJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdjdXJyZW50cGFzc3dvcmQnLCBjdHJsLnZtLnJlY29yZClcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTQnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ3Bhc3N3b3JkJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdwYXNzd29yZCcsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcigncGFzc3dvcmRjb25maXJtJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdwYXNzd29yZGNvbmZpcm0nLCBjdHJsLnZtLnJlY29yZClcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgKGN0cmwubWVzc2FnZSgpKSA/IG0oJy5hY3Rpb24tbWVzc2FnZS5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwubWVzc2FnZSgpKSA6IFwiXCIsXHJcbiAgICAgICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxyXG4gICAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcclxuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHtcclxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLm9uc3VibWl0LmJpbmQodGhpcywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCksXHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJylcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyLCB7c3RhbmRhbG9uZTogdHJ1ZX0pXHJcbiAgICBdKVxyXG59XHJcbiIsIu+7vyd1c2Ugc3RyaWN0JztcclxuLypnbG9iYWwgbSAqL1xyXG5pbXBvcnQge21yZXF1ZXN0LCBtZXRhZGF0YSwgbGFiZWxmb3IsIGlucHV0Zm9yLCBqb2luRXJyb3JzfSBmcm9tIFwiLi4vaGVscGVycy9mdW5jdGlvbnNcIlxyXG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gXCIuLi9sYXlvdXQvc3Bpbm5lclwiXHJcblxyXG52YXIgVXNlciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgZGF0YSA9IGRhdGEgfHwge31cclxuICAgIHRoaXMuZW1haWwgPSBtLnByb3AoZGF0YS5lbWFpbHx8ICcnKVxyXG4gICAgdGhpcy5maXJzdG5hbWUgPSBtLnByb3AoZGF0YS5maXJzdE5hbWUgfHwgJycpXHJcbiAgICB0aGlzLmxhc3RuYW1lID0gbS5wcm9wKGRhdGEubGFzdE5hbWUgfHwgJycpXHJcbiAgICB0aGlzLm1pZGRsZW5hbWUgPSBtLnByb3AoZGF0YS5taWRkbGVOYW1lIHx8ICcnKVxyXG4gICAgdGhpcy5iaXJ0aGRhdGUgPSBtLnByb3AoIChkYXRhLmJpcnRoRGF0ZSkgPyBkYXRhLmJpcnRoRGF0ZS5zcGxpdCgnVCcpWzBdIDogJycpXHJcbiAgICB0aGlzLmNvdW50cnkgPSBtLnByb3AoZGF0YS5jb3VudHJ5IHx8ICcnKVxyXG4gICAgdGhpcy5jaXR5ID0gbS5wcm9wKGRhdGEuY2l0eSB8fCAnJylcclxuICAgIHRoaXMuYWRkcmVzcyA9IG0ucHJvcChkYXRhLmFkZHJlc3MgfHwgJycpXHJcbiAgICB0aGlzLnppcCA9IG0ucHJvcChkYXRhLnppcCB8fCAnJylcclxuICAgIHRoaXMuY29tcGFueSA9IG0ucHJvcChkYXRhLmNvbXBhbnkgfHwgJycpXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbS5wcm9wKGRhdGEucG9zaXRpb258fCAnJylcclxuICAgIHRoaXMuaW50ZXJlc3RzID0gbS5wcm9wKGRhdGEuaW50ZXJlc3RzIHx8ICcnKVxyXG4gICAgdGhpcy5tZXRhID0gbS5wcm9wKG1ldGFkYXRhKGRhdGEubWV0YSkpXHJcbiAgICB0aGlzLl9fUmVxdWVzdFZlcmlmaWNhdGlvblRva2VuID0gbS5wcm9wKGdldHRva2VuKCkpXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgTWFuYWdlVXNlciA9IHt9XHJcbk1hbmFnZVVzZXIudm0gPSB7fVxyXG5NYW5hZ2VVc2VyLnZtLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmVjb3JkID0gbXJlcXVlc3QoeyBiYWNrZ3JvdW5kOiB0cnVlLCBtZXRob2Q6IFwiR0VUXCIsIHVybDogXCIvYXBpL21hbmFnZXVzZXJcIiwgdHlwZTogVXNlciB9KVxyXG4gICAgdGhpcy5yZWNvcmQudGhlbihtLnJlZHJhdylcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuTWFuYWdlVXNlci5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzXHJcbiAgICBjdHJsLnZtID0gTWFuYWdlVXNlci52bS5pbml0KClcclxuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0JTQsNC90L3Ri9C1INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1wiXHJcbiAgICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpIC8vbm90aWZpY2F0aW9uc1xyXG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJykgLy9yZXF1ZXN0IGVycm9yc1xyXG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcChmYWxzZSkgLy9yZXF1ZXN0IGlzIGJlaW5nIHByb2Nlc3NlZCAoc2hvdyBzcGlubmVyICYgcHJldmVudCBkb3VibGUgY2xpY2spXHJcbiAgICBjdHJsLm9uc3VibWl0ID0gZnVuY3Rpb24ocmVjb3JkKSB7XHJcbiAgICAgICAgaWYgKGN0cmwudXBkYXRpbmcoKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIC8vIHByZXZlbnQgZG91YmxlIGV2ZW50IHByb2Nlc3NpbmdcclxuICAgICAgICBjdHJsLm1lc3NhZ2UoJycpXHJcbiAgICAgICAgY3RybC5lcnJvcignJylcclxuICAgICAgICBjdHJsLnVwZGF0aW5nKHRydWUpXHJcbiAgICAgICAgbS5yZWRyYXcoKVxyXG4gICAgICAgIG1yZXF1ZXN0KHsgbWV0aG9kOiBcIlBVVFwiLCB1cmw6IFwiL2FwaS9tYW5hZ2V1c2VyXCIsIGRhdGE6IHJlY29yZCgpfSkudGhlbihcclxuICAgICAgICAgICAgKHN1Y2Nlc3MpID0+IHsgY3RybC51cGRhdGluZyhmYWxzZSk7IGN0cmwubWVzc2FnZSgn0JjQt9C80LXQvdC10L3QuNGPINGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpIH0sXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4geyBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgY3RybC5lcnJvcihcItCe0YjQuNCx0LrQsCEgXCIgKyBqb2luRXJyb3JzKGVycm9yKSkgfVxyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm4gZmFsc2UgLy9wcmV2ZW50RGVmYXVsdFxyXG4gICAgfVxyXG59XHJcbk1hbmFnZVVzZXIudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XHJcbiAgICByZXR1cm4gbShcIiNtYW5hZ2V1c2VyXCIsIFtcclxuICAgICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXHJcbiAgICAgICAgY3RybC52bS5yZWNvcmQoKSBcclxuICAgICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJywgW1xyXG4gICAgICAgICAgICBtKCcucm93JywgW1xyXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTgnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2VtYWlsJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdlbWFpbCcsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignYmlydGhkYXRlJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdiaXJ0aGRhdGUnLCBjdHJsLnZtLnJlY29yZClcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgbSgnLnJvdycsIFtcclxuICAgICAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwLmNvbC1tZC00JywgW1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdmaXJzdG5hbWUnLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2ZpcnN0bmFtZScsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignbWlkZGxlbmFtZScsIGN0cmwudm0ucmVjb3JkKSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcignbWlkZGxlbmFtZScsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignbGFzdG5hbWUnLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2xhc3RuYW1lJywgY3RybC52bS5yZWNvcmQpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIG0oJy5yb3cnLCBbXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignY291bnRyeScsIGN0cmwudm0ucmVjb3JkKSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcignY291bnRyeScsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignY2l0eScsIGN0cmwudm0ucmVjb3JkKSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcignY2l0eScsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignemlwJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCd6aXAnLCBjdHJsLnZtLnJlY29yZClcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXHJcbiAgICAgICAgICAgICAgICBsYWJlbGZvcignYWRkcmVzcycsIGN0cmwudm0ucmVjb3JkKSxcclxuICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdhZGRyZXNzJywgY3RybC52bS5yZWNvcmQpXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBtKCcucm93JywgW1xyXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTYnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2NvbXBhbnknLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2NvbXBhbnknLCBjdHJsLnZtLnJlY29yZClcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTYnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ3Bvc2l0aW9uJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdwb3NpdGlvbicsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcclxuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdpbnRlcmVzdHMnLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICBpbnB1dGZvcignaW50ZXJlc3RzJywgY3RybC52bS5yZWNvcmQpXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcclxuICAgICAgICAgICAgKGN0cmwuZXJyb3IoKSkgPyBtKCcuYWN0aW9uLWFsZXJ0LmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5lcnJvcigpKSA6IFwiXCIsXHJcbiAgICAgICAgICAgIG0oJy5hY3Rpb25zJywgW1xyXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwub25zdWJtaXQuYmluZCh0aGlzLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSxcclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0YXRgNCw0L3QuNGC0YwnKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcclxuICAgIF0pXHJcbn1cclxuIiwi77u/J3VzZSBzdHJpY3QnO1xyXG4vKmdsb2JhbCBtICovXHJcblxyXG5leHBvcnQgdmFyIGRhc2hib2FyZCA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwi0J/QsNC90LXQu9GMINCw0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGA0LBcIlxyXG4gICAgICAgIHJldHVybiB7IHRpdGxlOiBcIkRhc2hib2FyZCBUaXRsZSAkMVwiIH1cclxuICAgIH0sXHJcbiAgICB2aWV3OiBmdW5jdGlvbiAoY3RybCkge1xyXG4gICAgICAgIHJldHVybiBtKFwiaDFcIiwgY3RybC50aXRsZSlcclxuICAgIH1cclxufSIsIu+7vyd1c2Ugc3RyaWN0J1xyXG5cclxuLy90YWJsZSBtZXRhZGF0YVxyXG52YXIgTWV0YSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGRhdGEgPSBkYXRhIHx8IHt9XHJcbiAgICB2YXIgbWUgPSB0aGlzXHJcbiAgICBtZS5uYW1lID0gZGF0YS5wcm9wZXJ0eU5hbWUgfHwgXCJcIlxyXG4gICAgbWUuZGlzcGxheW5hbWUgPSBkYXRhLmRpc3BsYXlOYW1lIHx8IFwiXCJcclxuICAgIG1lLnR5cGUgPSBkYXRhLmRhdGFUeXBlTmFtZSB8fCBcIlwiXHJcbiAgICBtZS5pc3JlcXVpcmVkID0gZGF0YS5pc1JlcXVpcmVkIHx8IGZhbHNlXHJcbiAgICBtZS5pc3JlYWRvbmx5ID0gZGF0YS5pc1JlYWRPbmx5IHx8IGZhbHNlXHJcbiAgICBtZS5wbGFjZWhvbGRlciA9IGRhdGEucGxhY2Vob2xkZXIgfHwgXCJcIlxyXG59XHJcblxyXG5leHBvcnQgdmFyIGNvbmZpZyA9IHtcclxuICAgIGJyYW5kOiBcItCa0LDRgtCw0LvQvtCzINCf0KDQnlwiLFxyXG4gICAgYnJhbmRBZG1pbjogXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiXHJcbn0gXHJcblxyXG5leHBvcnQgdmFyIG1ldGFkYXRhID0gZnVuY3Rpb24obWV0YSkge1xyXG4gICAgbGV0IG1lID0gW11cclxuICAgIGlmIChtZXRhKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZCBvZiBtZXRhKSB7XHJcbiAgICAgICAgICAgIG1lLnB1c2gobmV3IE1ldGEoZCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1lXHJcbn1cclxuXHJcbi8vbmFtZSBpcyBhIHN0cmluZyBuYW1lIG9mIHByb3BlcnR5IGluIG1vZGVsXHJcbi8vbW9kZWwgLSByZXByZXNlbnRzIHRhYmxlIHJlY29yZCwgc2hvdWxkIGNvbnRhaW4gJ21ldGEnIHByb3BlcnR5IHdpdGggdGFibGUgbWV0YWRhdGEgZGVzY3JpcHRpb25cclxuZXhwb3J0IHZhciBsYWJlbGZvciA9IGZ1bmN0aW9uKG5hbWUsIG1vZGVsKSB7XHJcbiAgICBpZiAobW9kZWwgJiYgdHlwZW9mKG1vZGVsKSA9PSBcImZ1bmN0aW9uXCIgJiYgbW9kZWwoKS5tZXRhKSB7XHJcbiAgICAgICAgZm9yIChsZXQgbWUgb2YgbW9kZWwoKS5tZXRhKCkpIHtcclxuICAgICAgICAgICAgaWYgKG1lLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xhYmVsJywge1wiZm9yXCI6IFwiI1wiK25hbWV9LCAobWUuZGlzcGxheW5hbWUpID8gbWUuZGlzcGxheW5hbWUgOiBuYW1lKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBtKCdsYWJlbCcsIHtcImZvclwiOiBcIiNcIituYW1lfSwgbmFtZSlcclxufVxyXG5cclxuZXhwb3J0IHZhciBpbnB1dGZvciA9IGZ1bmN0aW9uKG5hbWUsIG1vZGVsKSB7XHJcbiAgICBpZiAobW9kZWwgJiYgdHlwZW9mKG1vZGVsKSA9PSBcImZ1bmN0aW9uXCIgJiYgbW9kZWwoKS5tZXRhKSB7XHJcbiAgICAgICAgZm9yIChsZXQgbWUgb2YgbW9kZWwoKS5tZXRhKCkpIHtcclxuICAgICAgICAgICAgaWYgKG1lLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogbmFtZSwgXHJcbiAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IChtZS5pc3JlYWRvbmx5KSA/IG51bGwgOiBtLndpdGhBdHRyKFwidmFsdWVcIiwgbW9kZWwoKVtuYW1lXSksIFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBtb2RlbCgpW25hbWVdKCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IG1lLmlzcmVhZG9ubHksXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IG1lLmlzcmVxdWlyZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5wdXRUeXBlKG1lKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbSgnaW5wdXQuZm9ybS1jb250cm9sJywge2lkOiBuYW1lfSlcclxufVxyXG5cclxuZXhwb3J0IHZhciBkaXNwbGF5Zm9yID0gZnVuY3Rpb24obmFtZSwgbW9kZWwpIHtcclxuICAgIGlmIChtb2RlbCAmJiB0eXBlb2YobW9kZWwpID09IFwiZnVuY3Rpb25cIiAmJiBtb2RlbCgpLm1ldGEpIHtcclxuICAgICAgICBmb3IgKGxldCBtZSBvZiBtb2RlbCgpLm1ldGEoKSkge1xyXG4gICAgICAgICAgICBpZiAobWUubmFtZS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1lLmRpc3BsYXluYW1lKSA/IG1lLmRpc3BsYXluYW1lIDogbmFtZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBuYW1lXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlucHV0VHlwZShtZSkge1xyXG4gICAgc3dpdGNoKG1lLnR5cGUpIHtcclxuICAgICAgICBjYXNlIFwiRW1haWxBZGRyZXNzXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImVtYWlsXCJcclxuICAgICAgICBjYXNlIFwiRGF0ZVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJkYXRlXCJcclxuICAgICAgICBjYXNlIFwiUGFzc3dvcmRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwicGFzc3dvcmRcIlxyXG4gICAgICAgIGRlZmF1bHQ6IFxyXG4gICAgICAgICAgICByZXR1cm4gJydcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBwYXJzZUVycm9yID0gZnVuY3Rpb24oZXJyc3RyKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBqb2luRXJyb3JzKEpTT04ucGFyc2UoZXJyc3RyKSlcclxuICAgIH1cclxuICAgIGNhdGNoKGVycikge1xyXG4gICAgICAgIHJldHVybiBlcnJzdHIgLy9yZXR1cm4gYXMgaXNcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBqb2luRXJyb3JzID0gZnVuY3Rpb24oZXJyb3JzKSB7XHJcbiAgICBpZiAodHlwZW9mKGVycm9ycykgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBsZXQgZXJyc3RyID0gXCJcIjtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXJyb3JzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YoZXJyb3JzW2tleV0pID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBla2V5IGluIGVycm9yc1trZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyc3RyICs9IGVycm9yc1trZXldW2VrZXldICsgXCIuIFwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVycnN0clxyXG4gICAgfSBlbHNlIFxyXG4gICAgICAgIHJldHVybiBlcnJvcnMgXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgcGFnZXMgPSBmdW5jdGlvbihhcmxlbiwgcGFnZXNpemUpIHtcclxuICAgIHJldHVybiBBcnJheShNYXRoLmZsb29yKGFybGVuL3BhZ2VzaXplKSArICgoYXJsZW4lcGFnZXNpemUgPiAwKSA/IDEgOiAwKSkuZmlsbCgwKTsgLy9yZXR1cm4gZW1wdHkgYXJyYXkgb2YgcGFnZXNcclxufVxyXG5cclxuZXhwb3J0IHZhciBzb3J0cyA9IGZ1bmN0aW9uKGxpc3QpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgcHJvcCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1ieVwiKVxyXG4gICAgICAgICAgICBpZiAocHJvcCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0ID0gbGlzdFswXVxyXG4gICAgICAgICAgICAgICAgbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYVtwcm9wXSgpID4gYltwcm9wXSgpID8gMSA6IGFbcHJvcF0oKSA8IGJbcHJvcF0oKSA/IC0xIDogMFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGlmIChmaXJzdCA9PT0gbGlzdFswXSkgbGlzdC5yZXZlcnNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBtcmVxdWVzdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuICAgIHZhciBub25Kc29uRXJyb3JzID0gZnVuY3Rpb24oeGhyKSB7XHJcbiAgICAgICAgcmV0dXJuICh4aHIuc3RhdHVzID4gMjA0ICYmIHhoci5yZXNwb25zZVRleHQubGVuZ3RoKSBcclxuICAgICAgICAgICAgPyBKU09OLnN0cmluZ2lmeSh4aHIucmVzcG9uc2VUZXh0KSBcclxuICAgICAgICAgICAgOiAoeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgID8geGhyLnJlc3BvbnNlVGV4dFxyXG4gICAgICAgICAgICA6IG51bGxcclxuICAgIH1cclxuICAgIGFyZ3MuZXh0cmFjdCA9IG5vbkpzb25FcnJvcnNcclxuICAgIHJldHVybiBtLnJlcXVlc3QoYXJncylcclxufVxyXG5cclxuZXhwb3J0IHZhciBzZXRDb29raWUgPSBmdW5jdGlvbihjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcclxuICAgIHZhciBkID0gbmV3IERhdGUoKTtcclxuICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMqMjQqNjAqNjAqMTAwMCkpO1xyXG4gICAgdmFyIGV4cGlyZXMgPSBcImV4cGlyZXM9XCIrIGQudG9VVENTdHJpbmcoKTtcclxuICAgIGRvY3VtZW50LmNvb2tpZSA9IGNuYW1lICsgXCI9XCIgKyBjdmFsdWUgKyBcIjtcIiArIGV4cGlyZXMgKyBcIjtwYXRoPS9cIjtcclxufVxyXG5cclxuZXhwb3J0IHZhciBnZXRDb29raWUgPSBmdW5jdGlvbihjbmFtZSkge1xyXG4gICAgdmFyIG5hbWUgPSBjbmFtZSArIFwiPVwiO1xyXG4gICAgdmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDxjYS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjID0gY2FbaV07XHJcbiAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApPT0nICcpIHtcclxuICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLGMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gXCJcIjtcclxufSIsIu+7vyd1c2Ugc3RyaWN0J1xyXG5cclxuaW1wb3J0IHttcmVxdWVzdH0gZnJvbSBcIi4vZnVuY3Rpb25zXCJcclxuXHJcbi8vYXJnczoge3VybDogXCIvYXBpL2V4YW1wbGVcIiwgdHlwZTogT2JqZWN0VHlwZX1cclxuZXhwb3J0IHZhciBNb2RlbCA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuICAgIGFyZ3MgPSBhcmdzIHx8IHt9XHJcbiAgICB2YXIgbW9kZWwgPSB0aGlzXHJcblxyXG4gICAgbW9kZWwuaW5kZXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbXJlcXVlc3Qoe1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsIFxyXG4gICAgICAgICAgICB1cmw6IGFyZ3MudXJsLCBcclxuICAgICAgICAgICAgdHlwZTogYXJncy50eXBlXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIG1vZGVsLmdldCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIG1yZXF1ZXN0KHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLCBcclxuICAgICAgICAgICAgdXJsOiBhcmdzLnVybCArIFwiL1wiICsgaWQsXHJcbiAgICAgICAgICAgIHR5cGU6IGFyZ3MudHlwZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBtb2RlbC5jcmVhdGUgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIG1yZXF1ZXN0ICh7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHRydWUsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIHVybDogYXJncy51cmwsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIG1vZGVsLnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbXJlcXVlc3Qoe1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUFVUXCIsXHJcbiAgICAgICAgICAgIHVybDogYXJncy51cmwsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIG1vZGVsLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIG1yZXF1ZXN0KHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxyXG4gICAgICAgICAgICB1cmw6IGFyZ3MudXJsICsgXCIvXCIgKyBpZCxcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCLvu78ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge2NvbmZpZ30gZnJvbSAnLi4vaGVscGVycy9mdW5jdGlvbnMnXHJcblxyXG5mdW5jdGlvbiBsYXlvdXQoY29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBsb2dvdXQoKSB7XHJcbiAgICAgICAgbS5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIiwgXHJcbiAgICAgICAgICAgIHVybDogXCIvYXBpL2xvZ09mZlwiLCBcclxuICAgICAgICB9KS50aGVuKChzdWNjZXNzKSA9PiB7d2luZG93LmxvY2F0aW9uID0gXCIvXCI7fSlcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGVhZGVyID0gbShcIm5hdi5uYXZiYXIubmF2YmFyLWRlZmF1bHRcIiwgW1xyXG4gICAgICAgIG0oJy5jb250YWluZXItZmx1aWQnLCBbXHJcbiAgICAgICAgICAgIG0oJy5uYXZiYXItaGVhZGVyJywgW1xyXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLm5hdmJhci10b2dnbGUuY29sbGFwc2VkW3R5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCIgZGF0YS10YXJnZXQ9XCIjbmF2YmFyLWNvbGxhcHNlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCJdJywgW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uc3Itb25seScsIFwiVG9nZ2xlIG5hdmlnYXRpb25cIiksXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5pY29uLWJhcicpLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uaWNvbi1iYXInKSxcclxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmljb24tYmFyJylcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgbSgnYS5uYXZiYXItYnJhbmRbaHJlZj1cIiNcIl0nLCBjb25maWcuYnJhbmRBZG1pbilcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIG0oJy5jb2xsYXBzZSBuYXZiYXItY29sbGFwc2UjbmF2YmFyLWNvbGxhcHNlJywgW1xyXG4gICAgICAgICAgICAgICAgbSgndWwubmF2Lm5hdmJhci1uYXYubmF2YmFyLXJpZ2h0JywgW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2xpJywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9cIl0nLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsYXknKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCBcItCh0LDQudGCXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBtKCdsaScsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCIjXCJdJywge29uY2xpY2s6IGxvZ291dH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtc2lnbi1vdXQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCBcItCS0YvQudGC0LhcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdKVxyXG5cclxuICAgIHZhciBuYXZsaW5rID0gZnVuY3Rpb24gKHVybCwgdGl0bGUpIHtcclxuICAgICAgICByZXR1cm4gbSgnbGknLCB7IGNsYXNzOiAobS5yb3V0ZSgpLmluY2x1ZGVzKHVybCkpID8gXCJhY3RpdmVcIiA6IFwiXCIgfSwgbSgnYScsIHsgaHJlZjogdXJsLCBjb25maWc6IG0ucm91dGUgfSwgdGl0bGUpKVxyXG4gICAgfVxyXG4gICAgdmFyIHNpZGViYXIgPSBbXHJcbiAgICAgICAgbSgnLnBhbmVsLnBhbmVsLWRlZmF1bHQnLCBbXHJcbiAgICAgICAgICAgIG0oJ3VsLm5hdiBuYXYtcGlsbHMgbmF2LXN0YWNrZWQnLCBbXHJcbiAgICAgICAgICAgICAgICBuYXZsaW5rKFwiL2NhdGVnb3JpZXNcIiwgXCLQmtCw0YLQtdCz0L7RgNC40Lgg0YLQvtCy0LDRgNC+0LJcIiksXHJcbiAgICAgICAgICAgICAgICBuYXZsaW5rKFwiL3Byb2R1Y3RzXCIsIFwi0KLQvtCy0LDRgNGLXCIpLFxyXG4gICAgICAgICAgICAgICAgbmF2bGluayhcIi9hY2NvdW50XCIsIFwi0KPRh9C10YLQvdCw0Y8g0LfQsNC/0LjRgdGMXCIpLFxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdXHJcblxyXG4gICAgdmFyIGZvb3RlciA9IFtcclxuICAgICAgICBtKCdmb290ZXIjZm9vdGVyJywgW1xyXG4gICAgICAgICAgICBtKCcuY29udGFpbmVyJywgW1xyXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgXCLQn9C+0LTQstCw0Lsg0YHQsNC50YLQsFwiKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIGhlYWRlcixcclxuICAgICAgICBtKFwiI2NvbnRlbnQtd3JhcHBlci5jb250YWluZXJcIiwgW1xyXG4gICAgICAgICAgICBtKCcjc2lkZWJhcicsIHNpZGViYXIpLFxyXG4gICAgICAgICAgICBtKCcjY29udGVudCcsIG0uY29tcG9uZW50KGNvbXBvbmVudCkpXHJcbiAgICAgICAgXSksXHJcbiAgICAgICAgZm9vdGVyXHJcbiAgICBdO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbWl4aW5MYXlvdXQobGF5b3V0LCBjb21wb25lbnQpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGxheW91dChjb21wb25lbnQpO1xyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF5b3V0KGNvbXBvbmVudCkge1xyXG4gICAgcmV0dXJuIHsgY29udHJvbGxlcjogZnVuY3Rpb24gKCkgeyB9LCB2aWV3OiBtaXhpbkxheW91dChsYXlvdXQsIGNvbXBvbmVudCkgfVxyXG59Iiwi77u/J3VzZSBzdHJpY3QnXHJcblxyXG5pbXBvcnQge3NldENvb2tpZX0gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcclxuZXhwb3J0IHZhciBQYWdlU2l6ZVNlbGVjdG9yID0ge31cclxuXHJcbi8vYXJnIGlzIGFuIG0ucHJvcCBvZiBwYWdlc2l6ZSBpbiB0aGUgcGFyZW50IGNvbnRyb2xsZXJcclxuUGFnZVNpemVTZWxlY3Rvci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJnKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXNcclxuICAgIGN0cmwuc2V0cGFnZXNpemUgPSBmdW5jdGlvbihzaXplKSB7XHJcbiAgICAgICAgYXJnKHNpemUpXHJcbiAgICAgICAgc2V0Q29va2llKFwicGFnZXNpemVcIiwgc2l6ZSwgMzY1KSAvL3N0b3JlIHBhZ2VzaXplIGluIGNvb2tpZXNcclxuICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbn1cclxuXHJcblBhZ2VTaXplU2VsZWN0b3IudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZykge1xyXG4gICAgcmV0dXJuIG0oJyNwYWdlc2l6ZXNlbGVjdG9yJywgW1xyXG4gICAgICAgIG0oJ3NwYW4nLCBcItCf0L7QutCw0LfRi9Cy0LDRgtGMINC90LAg0YHRgtGA0LDQvdC40YbQtTogXCIpLFxyXG4gICAgICAgIFsxMCwgNTAsIDEwMCwgNTAwXS5tYXAoZnVuY3Rpb24oc2l6ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbSgnYVtocmVmPSNdJywge2NsYXNzOiAoc2l6ZSA9PSBhcmcoKSkgPyAnYWN0aXZlJyA6ICcnLCBvbmNsaWNrOiBjdHJsLnNldHBhZ2VzaXplLmJpbmQodGhpcywgc2l6ZSl9LCBzaXplKVxyXG4gICAgICAgIH0pXHJcbiAgICBdKVxyXG59Iiwi77u/J3VzZSBzdHJpY3QnXHJcblxyXG5pbXBvcnQge3BhZ2VzfSBmcm9tICcuLi9oZWxwZXJzL2Z1bmN0aW9ucydcclxuZXhwb3J0IHZhciBQYWdpbmF0b3IgPSB7fVxyXG5cclxuUGFnaW5hdG9yLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXNcclxuICAgIGN0cmwuc2V0cGFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgYXJncy5vbnNldHBhZ2UoaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbn1cclxuXHJcblBhZ2luYXRvci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xyXG4gICAgcmV0dXJuIG0oJyNwYWdpbmF0b3InLCBcclxuICAgICAgICAoYXJncy5saXN0KCkubGVuZ3RoID4gYXJncy5wYWdlc2l6ZSgpKVxyXG4gICAgICAgID8gbSgnbmF2JywgW1xyXG4gICAgICAgICAgICBtKCd1bC5wYWdpbmF0aW9uJywgXHJcbiAgICAgICAgICAgICAgICBwYWdlcyhhcmdzLmxpc3QoKS5sZW5ndGgsIGFyZ3MucGFnZXNpemUoKSlcclxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24ocCwgaW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIHtjbGFzczogKGluZGV4ID09IGFyZ3MuY3VycmVudHBhZ2UoKSkgPyAnYWN0aXZlJyA6ICcnfSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChpbmRleCA9PSBhcmdzLmN1cnJlbnRwYWdlKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbSgnc3BhbicsIGluZGV4KzEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbSgnYVtocmVmPS9dJywge29uY2xpY2s6IGN0cmwuc2V0cGFnZS5iaW5kKHRoaXMsIGluZGV4KX0sIGluZGV4KzEpXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgOiBcIlwiXHJcbiAgICApXHJcbn0iLCLvu78ndXNlIHN0cmljdCdcclxuXHJcbnZhciBMb2FkaW5nU3Bpbm5lciA9IHt9XHJcblxyXG5Mb2FkaW5nU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oKSB7fVxyXG5Mb2FkaW5nU3Bpbm5lci52aWV3ID0gZnVuY3Rpb24oY3RybCkge1xyXG4gICAgcmV0dXJuIG0oJyNsb2FkaW5nLXNwaW5uZXIuYW5pbWF0ZWQuZmFkZUluJywgW1xyXG4gICAgICAgIG0oJ3AudGV4dC1jZW50ZXInLCBtKCdpLmZhLmZhLXNwaW4uZmEtY29nLmZhLTN4JykpLFxyXG4gICAgICAgIG0oJ3AudGV4dC1jZW50ZXInLCAn0J/QvtC00L7QttC00LjRgtC1LCDQuNC00LXRgiDQt9Cw0LPRgNGD0LfQutCwLi4uJylcclxuICAgIF0pXHJcbn1cclxuXHJcbnZhciBVcGRhdGluZ1NwaW5uZXIgPSB7fVxyXG5cclxuVXBkYXRpbmdTcGlubmVyLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7fVxyXG5VcGRhdGluZ1NwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcclxuICAgIHJldHVybiBtKCcjdXBkYXRpbmctc3Bpbm5lci5hbmltYXRlZC5mYWRlSW4nLCBbXHJcbiAgICAgICAgbSgncCNzcGlubmVyLXRleHQnLCBtKCdpLmZhLmZhLXNwaW4uZmEtY29nLmZhLTN4JykpLFxyXG4gICAgXSlcclxufVxyXG5cclxuZXhwb3J0IHZhciBTcGlubmVyID0ge31cclxuU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzXHJcbiAgICBjdHJsLnN0YW5kYWxvbmUgPSAoYXJncyAmJiBhcmdzLnN0YW5kYWxvbmUpID8gdHJ1ZSA6IGZhbHNlO1xyXG59XHJcblNwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcclxuICAgIHJldHVybiBtKCcjc3Bpbm5lcicsIFxyXG4gICAgICAgIChjdHJsLnN0YW5kYWxvbmUpIFxyXG4gICAgICAgID8gbS5jb21wb25lbnQoTG9hZGluZ1NwaW5uZXIpIFxyXG4gICAgICAgIDogbS5jb21wb25lbnQoVXBkYXRpbmdTcGlubmVyKVxyXG4gICAgKVxyXG59Iiwi77u/J3VzZSBzdHJpY3QnXHJcblxyXG5leHBvcnQgdmFyIFRhYnMgPSB7fVxyXG5cclxuLy9hcmdzIGlzIGFuIGFycmF5IG9mIG9iamVjdHMge2lkOiBcInRhYiBpZFwiLCB0aXRsZTogXCJ0YWIgdGl0bGVcIiwgY29tcG9uZW50OiBcImNvbXBvbmVudCB0byBiZSByZW5kZXJlZCBpbiB0aGF0IHRhYlwifVxyXG5UYWJzLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXNcclxuICAgIGN0cmwuYWN0aXZlID0gbS5wcm9wKGFyZ3NbMF0uaWQpXHJcbiAgICBjdHJsLnNldGFjdGl2ZSA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgY3RybC5hY3RpdmUoaWQpXHJcbiAgICB9XHJcbn1cclxuXHJcblRhYnMudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcclxuICAgIHJldHVybiBtKCcudGFicycsIFtcclxuICAgICAgICBtKCd1bC5uYXYubmF2LXRhYnNbcm9sZT1cInRhYmxpc3RcIl0nLCBcclxuICAgICAgICAgICAgYXJncy5tYXAoZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpW3JvbGU9XCJwcmVzZW50YXRpb25cIl0nLCBcclxuICAgICAgICAgICAgICAgICAgICB7Y2xhc3M6IChjdHJsLmFjdGl2ZSgpID09IGRhdGEuaWQpID8gXCJhY3RpdmVcIiA6IFwiXCJ9LCBcclxuICAgICAgICAgICAgICAgICAgICBtKCdhJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWNvbnRyb2xzXCI6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6IFwidGFiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS10b2dnbGVcIjogXCJ0YWJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHJlZjogXCIjXCIgKyBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNldGFjdGl2ZS5iaW5kKHRoaXMsIGRhdGEuaWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGRhdGEudGl0bGUpKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICksXHJcbiAgICAgICAgbSgnLnRhYi1jb250ZW50JywgXHJcbiAgICAgICAgICAgIGFyZ3MubWFwKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoY3RybC5hY3RpdmUoKSA9PSBkYXRhLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgID8gbSgnLnRhYi1wYW5lLmFjdGl2ZVtyb2xlPVwidGFicGFuZWxcIl0nLCB7aWQ6IGRhdGEuaWR9LCBtLmNvbXBvbmVudChkYXRhLmNvbXBvbmVudCkpXHJcbiAgICAgICAgICAgICAgICAgICAgOiBcIlwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKVxyXG4gICAgXSlcclxufSIsIu+7vyd1c2Ugc3RyaWN0JztcclxuLypnbG9iYWwgbSAqL1xyXG5cclxuaW1wb3J0IHtkYXNoYm9hcmR9IGZyb20gXCIuL2Rhc2hib2FyZFwiXHJcbmltcG9ydCB7Q2F0ZWdvcnlHcmlkfSBmcm9tIFwiLi9wcm9kdWN0L2NhdGVnb3J5Z3JpZFwiXHJcbmltcG9ydCB7UHJvZHVjdExpc3R9IGZyb20gXCIuL3Byb2R1Y3QvcHJvZHVjdGxpc3RcIlxyXG5pbXBvcnQge1Byb2R1Y3RQYWdlfSBmcm9tIFwiLi9wcm9kdWN0L3Byb2R1Y3RcIlxyXG5pbXBvcnQge0FjY291bnR9IGZyb20gXCIuL2FjY291bnQvYWNjb3VudFwiXHJcbmltcG9ydCB7d2l0aExheW91dH0gZnJvbSBcIi4vbGF5b3V0L2xheW91dFwiXHJcblxyXG4vL3NldHVwIHJvdXRlcyB0byBzdGFydCB3LyB0aGUgYCNgIHN5bWJvbFxyXG5tLnJvdXRlLm1vZGUgPSBcImhhc2hcIjtcclxuXHJcbm0ucm91dGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZG1pbi1hcHBcIiksIFwiL1wiLCB7XHJcbiAgICBcIi9cIjogd2l0aExheW91dChkYXNoYm9hcmQpLFxyXG4gICAgXCIvYWNjb3VudFwiOiB3aXRoTGF5b3V0KEFjY291bnQpLFxyXG4gICAgXCIvY2F0ZWdvcmllc1wiOiB3aXRoTGF5b3V0KENhdGVnb3J5R3JpZCksXHJcbiAgICBcIi9wcm9kdWN0c1wiOiB3aXRoTGF5b3V0KFByb2R1Y3RMaXN0KSxcclxuICAgIFwiL3Byb2R1Y3RzLzppZFwiOiB3aXRoTGF5b3V0KFByb2R1Y3RQYWdlKSxcclxufSk7Iiwi77u/J3VzZSBzdHJpY3QnO1xyXG4vKmdsb2JhbCBtICovXHJcblxyXG5pbXBvcnQge21yZXF1ZXN0LCBwYXJzZUVycm9yLCBkaXNwbGF5Zm9yLCBtZXRhZGF0YSwgaW5wdXRmb3IsIHBhZ2VzLCBzb3J0cywgZ2V0Q29va2llLCBzZXRDb29raWV9IGZyb20gXCIuLi9oZWxwZXJzL2Z1bmN0aW9uc1wiXHJcbmltcG9ydCB7TW9kZWx9IGZyb20gXCIuLi9oZWxwZXJzL21vZGVsXCJcclxuaW1wb3J0IHtTcGlubmVyfSBmcm9tIFwiLi4vbGF5b3V0L3NwaW5uZXJcIlxyXG5pbXBvcnQge1BhZ2VTaXplU2VsZWN0b3J9IGZyb20gXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiXHJcbmltcG9ydCB7UGFnaW5hdG9yfSBmcm9tIFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiXHJcblxyXG5leHBvcnQgdmFyIENhdGVnb3J5ID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBkYXRhID0gZGF0YSB8fCB7fVxyXG4gICAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApXHJcbiAgICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKVxyXG4gICAgdGhpcy5pc3B1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLmlzUHVibGlzaGVkIHx8IGZhbHNlKVxyXG4gICAgdGhpcy5fX1JlcXVlc3RWZXJpZmljYXRpb25Ub2tlbiA9IG0ucHJvcChnZXR0b2tlbigpKVxyXG59XHJcblxyXG5leHBvcnQgdmFyIENhdGVnb3J5R3JpZCA9IHt9XHJcbkNhdGVnb3J5R3JpZC52bSA9IHt9XHJcbkNhdGVnb3J5R3JpZC52bS5pbml0ID0gZnVuY3Rpb24oYXJncykge1xyXG4gICAgYXJncyA9IGFyZ3MgfHwge31cclxuICAgIHZhciB2bSA9IHRoaXNcclxuICAgIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9jYXRlZ29yaWVzXCIsIHR5cGU6IENhdGVnb3J5fSlcclxuICAgIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcbkNhdGVnb3J5R3JpZC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzXHJcblxyXG4gICAgY3RybC52bSA9IENhdGVnb3J5R3JpZC52bS5pbml0KClcclxuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSkgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXHJcbiAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KSAvL2hpZGUgc3Bpbm5lciBhbmQgcmVkcmF3IGFmdGVyIGRhdGEgYXJyaXZlIFxyXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQmtCw0YLQtdCz0L7RgNC40Lgg0YLQvtCy0LDRgNC+0LJcIlxyXG4gICAgY3RybC5lZGl0aW5naWQgPSBtLnByb3AoJycpIC8vaWQgb2YgdGhlIHJvdywgdGhhdCBpcyBiZWluZyBlZGl0ZWRcclxuICAgIGN0cmwucmVjb3JkID0gbS5wcm9wKCcnKSAvL3RlbXBvcmFyeSBzdGF0ZSBvZiB0aGUgcm93LCB0aGF0IGlzIGJlaW5nIGVkaXRlZFxyXG4gICAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChnZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCkgLy9udW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2VcclxuICAgIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCkgLy9jdXJyZW50IHBhZ2UsIHN0YXJ0aW5nIHdpdGggMFxyXG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJylcclxuXHJcbiAgICBjdHJsLnN0YXJ0ZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIGN0cmwuZWRpdGluZ2lkKHJvdy5pZCgpKVxyXG4gICAgICAgIGN0cmwucmVjb3JkID0gbmV3IENhdGVnb3J5KHtpZDogcm93LmlkKCksIGlzUHVibGlzaGVkOiByb3cuaXNwdWJsaXNoZWQoKSwgbmFtZTogcm93Lm5hbWUoKX0pXHJcbiAgICB9XHJcbiAgICBjdHJsLnVwZGF0ZSA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcclxuICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgY3RybC52bS5tb2RlbC51cGRhdGUoY3RybC5yZWNvcmQpXHJcbiAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmVkaXRpbmdpZCgnJylcclxuICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpW2N0cmwudm0ubGlzdCgpLmluZGV4T2Yocm93KV0gPSBjdHJsLnJlY29yZCAvL3VwZGF0ZSBjdXJyZW50IHJvdyBpbiBncmlkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4gY3RybC5lcnJvcihwYXJzZUVycm9yKGVycm9yKSlcclxuICAgICAgICApLnRoZW4oKCkgPT4ge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpfSlcclxuICAgIH1cclxuICAgIGN0cmwuc3RhcnRjcmVhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBjdHJsLmVkaXRpbmdpZCgnbmV3JylcclxuICAgICAgICBjdHJsLnJlY29yZCA9IG5ldyBDYXRlZ29yeSh7aWQ6IDAsIGlzUHVibGlzaGVkOiB0cnVlLCBuYW1lOiAnJ30pXHJcbiAgICB9XHJcbiAgICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcclxuICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC5yZWNvcmQpLnRoZW4oXHJcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KClcclxuICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5lZGl0aW5naWQoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcclxuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXHJcbiAgICAgICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXHJcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICB9XHJcbiAgICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKSAvL3ByZXZlbnQgdHIub25jbGljayB0cmlnZ2VyXHJcbiAgICAgICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXHJcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmxpc3QgPSBjdHJsLnZtLm1vZGVsLmluZGV4KClcclxuICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gcGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmN1cnJlbnRwYWdlKE1hdGgubWF4KGN0cmwuY3VycmVudHBhZ2UoKS0xLCAwKSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICB9XHJcbiAgICBjdHJsLmNhbmNlbGVkaXQgPSBmdW5jdGlvbigpeyBjdHJsLmVkaXRpbmdpZCgnJykgfVxyXG59XHJcbkNhdGVnb3J5R3JpZC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcclxuXHJcbiAgICB2YXIgZWRpdFJvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIG0oJ3RyJywge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCAhaW5pdCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIGN0cmwudXBkYXRlKGRhdGEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDI3KSB7IGN0cmwuY2FuY2VsZWRpdCgpOyBtLnJlZHJhdygpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycsIGN0cmwucmVjb3JkLmlkKCkpLFxyXG4gICAgICAgICAgICAgICAgbSgndGQnLCBtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggIWluaXQgKSBlbC5mb2N1cygpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5yZWNvcmQubmFtZSgpLCBcclxuICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwucmVjb3JkLm5hbWUpXHJcbiAgICAgICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsnLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywgeyBjaGVja2VkOiBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCgpLCBvbmNsaWNrOiBtLndpdGhBdHRyKFwiY2hlY2tlZFwiLCBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCl9KVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJywgW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCh0L7RhdGA0LDQvdC40YLRjF0nLCB7b25jbGljazogY3RybC51cGRhdGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtY2hlY2snKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRlZmF1bHRbdGl0bGU90J7RgtC80LXQvdCwXScsIHtvbmNsaWNrOiBjdHJsLmNhbmNlbGVkaXR9LCBtKCdpLmZhLmZhLXRpbWVzJykpXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKSwgLy90clxyXG4gICAgICAgICAgICBjdHJsLmVycm9yKClcclxuICAgICAgICAgICAgPyBtKCd0ci5lcnJvci5hbmltYXRlZC5mYWRlSW4nLCBbXHJcbiAgICAgICAgICAgICAgICBtKCd0ZCcpLFxyXG4gICAgICAgICAgICAgICAgbSgndGQudGV4dC1kYW5nZXJbY29sc3Bhbj0yXScsIGN0cmwuZXJyb3IoKSksXHJcbiAgICAgICAgICAgICAgICBtKCd0ZCcpXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIDogXCJcIlxyXG4gICAgICAgIF1cclxuICAgIH0gLy9lZGl0Um93VGVtcGxhdGVcclxuXHJcbiAgICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuaWQoKSksXHJcbiAgICAgICAgICAgICAgICBtKCd0ZCcsIGRhdGEubmFtZSgpKSxcclxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluay50ZXh0LWNlbnRlcicsIGRhdGEuaXNwdWJsaXNoZWQoKSA/IG0oJ2kuZmEuZmEtY2hlY2snKSA6IG0oJ2kuZmEuZmEtdGltZXMnKSksXHJcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLWRhbmdlclt0aXRsZT3Qo9C00LDQu9C40YLRjF0nLCB7b25jbGljazogY3RybC5kZWxldGUuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcmVtb3ZlJykpXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKVxyXG4gICAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxyXG5cclxuICAgIHZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBtKCd0cicsIHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiggIWluaXQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDEzKSBjdHJsLmNyZWF0ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDI3KSB7IGN0cmwuY2FuY2VsZWRpdCgpOyBtLnJlZHJhdygpOyByZXR1cm4gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycpLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3RkJywgbSgnaW5wdXQuZm9ybS1jb250cm9sJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uKGVsLCBpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggIWluaXQgKSBlbC5mb2N1cygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLnJlY29yZC5uYW1lKCksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwucmVjb3JkLm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywgeyBjaGVja2VkOiBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCgpLCBvbmNsaWNrOiBtLndpdGhBdHRyKFwiY2hlY2tlZFwiLCBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCl9KVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCh0L7Qt9C00LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmNyZWF0ZX0sIG0oJ2kuZmEuZmEtY2hlY2snKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCe0YLQvNC10L3QsF0nLCB7b25jbGljazogY3RybC5jYW5jZWxlZGl0fSwgbSgnaS5mYS5mYS10aW1lcycpKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICksIC8vdHJcclxuICAgICAgICAgICAgY3RybC5lcnJvcigpXHJcbiAgICAgICAgICAgID8gbSgndHIuZXJyb3IuYW5pbWF0ZWQuZmFkZUluJywgW1xyXG4gICAgICAgICAgICAgICAgbSgndGQnKSxcclxuICAgICAgICAgICAgICAgIG0oJ3RkLnRleHQtZGFuZ2VyW2NvbHNwYW49Ml0nLCBjdHJsLmVycm9yKCkpLFxyXG4gICAgICAgICAgICAgICAgbSgndGQnKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICA6IFwiXCJcclxuICAgICAgICBdXHJcbiAgICB9IC8vY3JlYXRlVGVtcGxhdGVcclxuXHJcbiAgICAvL2NvbXBsZXRlIHZpZXdcclxuICAgIHJldHVybiBtKFwiI2NhdGVnb3J5bGlzdFwiLCBbXHJcbiAgICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxyXG4gICAgICAgIG0oJ2RpdicsIFtcclxuICAgICAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBzb3J0cyhjdHJsLnZtLmxpc3QoKSksIFtcclxuICAgICAgICAgICAgICAgIG0oJ3RoZWFkJywgXHJcbiAgICAgICAgICAgICAgICAgICAgbSgndHInLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlkXScsICfihJYnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1uYW1lXScsICfQndCw0LfQstCw0L3QuNC1JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlzcHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmFjdGlvbnMnLCAnIycpXHJcbiAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBtKCd0Ym9keScsIFxyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcclxuICAgICAgICAgICAgICAgICAgICA/IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zbGljZSBmaWx0ZXJzIHJlY29yZHMgZnJvbSBjdXJyZW50IHBhZ2Ugb25seVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGN0cmwuY3VycmVudHBhZ2UoKSpjdHJsLnBhZ2VzaXplKCksIChjdHJsLmN1cnJlbnRwYWdlKCkrMSkqY3RybC5wYWdlc2l6ZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGN0cmwuZWRpdGluZ2lkKCkgPT0gZGF0YS5pZCgpKSA/IGVkaXRSb3dUZW1wbGF0ZShkYXRhKSA6IHNob3dSb3dUZW1wbGF0ZShkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLmVkaXRpbmdpZCgpID09IFwibmV3XCIpID8gY3JlYXRlVGVtcGxhdGUoKSA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcclxuICAgICAgICAgICAgICAgICksIC8vdGJvZHlcclxuICAgICAgICAgICAgXSksIC8vdGFibGVcclxuICAgICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXHJcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5JywgeyBvbmNsaWNrOiBjdHJsLnN0YXJ0Y3JlYXRlIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcclxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQsNGC0LXQs9C+0YDQuNGOJylcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgbSgnLnB1bGwtcmlnaHQnLCBtLmNvbXBvbmVudChQYWdlU2l6ZVNlbGVjdG9yLCBjdHJsLnBhZ2VzaXplKSlcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpID8gbS5jb21wb25lbnQoUGFnaW5hdG9yLCB7bGlzdDogY3RybC52bS5saXN0LCBwYWdlc2l6ZTogY3RybC5wYWdlc2l6ZSwgY3VycmVudHBhZ2U6IGN0cmwuY3VycmVudHBhZ2UsIG9uc2V0cGFnZTogY3RybC5jdXJyZW50cGFnZX0pIDogXCJcIixcclxuICAgICAgICBdKVxyXG4gICAgXSlcclxufSIsIu+7vyd1c2Ugc3RyaWN0JztcclxuLypnbG9iYWwgbSAqL1xyXG5cclxuaW1wb3J0IHttcmVxdWVzdCwgcGFyc2VFcnJvciwgZGlzcGxheWZvciwgbWV0YWRhdGEsIGlucHV0Zm9yLCBwYWdlcywgc29ydHMsIGdldENvb2tpZSwgc2V0Q29va2llfSBmcm9tIFwiLi4vaGVscGVycy9mdW5jdGlvbnNcIlxyXG5pbXBvcnQge01vZGVsfSBmcm9tIFwiLi4vaGVscGVycy9tb2RlbFwiXHJcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSBcIi4uL2xheW91dC9zcGlubmVyXCJcclxuaW1wb3J0IHtQYWdlU2l6ZVNlbGVjdG9yfSBmcm9tIFwiLi4vbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3JcIlxyXG5pbXBvcnQge1BhZ2luYXRvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdpbmF0b3JcIlxyXG5pbXBvcnQge0NhdGVnb3J5fSBmcm9tIFwiLi9jYXRlZ29yeWdyaWRcIlxyXG5cclxuZXhwb3J0IHZhciBDYXRlZ29yeVNlbGVjdCA9IHt9XHJcbkNhdGVnb3J5U2VsZWN0LnZtID0ge31cclxuQ2F0ZWdvcnlTZWxlY3Qudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuICAgIGFyZ3MgPSBhcmdzIHx8IHt9XHJcbiAgICB2YXIgdm0gPSB0aGlzXHJcbiAgICB2bS5saXN0ID0gbXJlcXVlc3QoeyBtZXRob2Q6IFwiR0VUXCIsIHVybDogXCIvYXBpL2NhdGVnb3JpZXNcIiwgdHlwZTogQ2F0ZWdvcnkgfSlcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbi8vYXJnczoge3ZhbHVlOiBtLnByb3AsIGVycm9yOiBtLnByb3Agb3B0aW9uYWx9XHJcbkNhdGVnb3J5U2VsZWN0LmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XHJcbiAgICBhcmdzID0gYXJncyB8fCB7fVxyXG4gICAgdmFyIGN0cmwgPSB0aGlzXHJcbiAgICBjdHJsLnZhbHVlID0gYXJncy52YWx1ZVxyXG4gICAgY3RybC52bSA9IENhdGVnb3J5U2VsZWN0LnZtLmluaXQoKVxyXG4gICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oZGF0YSl7IGlmIChkYXRhLmxlbmd0aCkgY3RybC52YWx1ZShkYXRhWzBdLmlkKCkpIH0pIC8vaW5pdGlhbCB2YWx1ZVxyXG4gICAgY3RybC5lcnJvciA9IGFyZ3MuZXJyb3IgfHwgbS5wcm9wKCcnKVxyXG59XHJcbkNhdGVnb3J5U2VsZWN0LnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XHJcbiAgICByZXR1cm4gbShcInNlbGVjdC5mb3JtLWNvbnRyb2xcIiwge1xyXG4gICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwudmFsdWUpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjdHJsLnZtLmxpc3QoKSBcclxuICAgICAgICA/IGN0cmwudm0ubGlzdCgpLm1hcChmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvbicsIHt2YWx1ZTogZGF0YS5pZCgpfSwgZGF0YS5uYW1lKCkpXHJcbiAgICAgICAgfSlcclxuICAgICAgICA6IFwiXCJcclxuICAgIClcclxufSIsIu+7vyd1c2Ugc3RyaWN0JztcclxuLypnbG9iYWwgbSAqL1xyXG5cclxuaW1wb3J0IHttcmVxdWVzdCwgcGFyc2VFcnJvciwgZGlzcGxheWZvciwgbWV0YWRhdGEsIGxhYmVsZm9yLCBpbnB1dGZvciwgcGFnZXMsIHNvcnRzLCBnZXRDb29raWUsIHNldENvb2tpZX0gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcclxuaW1wb3J0IHtNb2RlbH0gZnJvbSBcIi4uL2hlbHBlcnMvbW9kZWxcIlxyXG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gXCIuLi9sYXlvdXQvc3Bpbm5lclwiXHJcbmltcG9ydCB7UGFnZVNpemVTZWxlY3Rvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCJcclxuaW1wb3J0IHtQYWdpbmF0b3J9IGZyb20gXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCJcclxuaW1wb3J0IHtDYXRlZ29yeX0gZnJvbSBcIi4vY2F0ZWdvcnlncmlkXCJcclxuaW1wb3J0IHtDYXRlZ29yeVNlbGVjdH0gZnJvbSBcIi4vY2F0ZWdvcnlzZWxlY3RcIlxyXG5cclxuZXhwb3J0IHZhciBQcm9kdWN0ID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBkYXRhID0gZGF0YSB8fCB7fVxyXG4gICAgdGhpcy5pZCA9IG0ucHJvcChkYXRhLmlkIHx8IDApXHJcbiAgICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKVxyXG4gICAgdGhpcy5pc3B1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLmlzUHVibGlzaGVkIHx8IGZhbHNlKVxyXG4gICAgdGhpcy5jYXRlZ29yeW5hbWUgPSBtLnByb3AoZGF0YS5jYXRlZ29yeU5hbWUgfHwgJycpXHJcbiAgICB0aGlzLmNhdGVnb3J5aWQgPSBtLnByb3AoZGF0YS5jYXRlZ29yeUlkIHx8IDApXHJcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEuZGVzY3JpcHRpb24gfHwgJycpXHJcbiAgICB0aGlzLmltYWdlID0gbS5wcm9wKGRhdGEuaW1hZ2UgfHwgJycpXHJcbiAgICB0aGlzLnByaWNlID0gbS5wcm9wKGRhdGEucHJpY2UgfHwgbnVsbClcclxuICAgIHRoaXMubWV0YSA9IG0ucHJvcChtZXRhZGF0YShkYXRhLm1ldGEpKVxyXG4gICAgdGhpcy5fX1JlcXVlc3RWZXJpZmljYXRpb25Ub2tlbiA9IG0ucHJvcChnZXR0b2tlbigpKVxyXG59XHJcblxyXG5leHBvcnQgdmFyIFByb2R1Y3RQYWdlID0ge31cclxuUHJvZHVjdFBhZ2Uudm0gPSB7fVxyXG5Qcm9kdWN0UGFnZS52bS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdm0gPSB0aGlzXHJcbiAgICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvcHJvZHVjdHNcIiwgdHlwZTogUHJvZHVjdH0pXHJcbiAgICB2bS5yZWNvcmQgPSAgdm0ubW9kZWwuZ2V0KG0ucm91dGUucGFyYW0oXCJpZFwiKSlcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuUHJvZHVjdFBhZ2UuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjdHJsID0gdGhpc1xyXG5cclxuICAgIGN0cmwudm0gPSBQcm9kdWN0UGFnZS52bS5pbml0KClcclxuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSkgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXHJcbiAgICBjdHJsLnZtLnJlY29yZC50aGVuKGZ1bmN0aW9uKCkge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpO30pIC8vaGlkZSBzcGlubmVyIGFuZCByZWRyYXcgYWZ0ZXIgZGF0YSBhcnJpdmUgXHJcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpID8gXCLQodC+0LfQtNCw0L3QuNC1INC90L7QstC+0LPQviDRgtC+0LLQsNGA0LBcIiA6IFwi0JrQsNGA0YLQvtGH0LrQsCDRgtC+0LLQsNGA0LBcIlxyXG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJylcclxuICAgIGN0cmwubWVzc2FnZSA9IG0ucHJvcCgnJykgLy9ub3RpZmljYXRpb25zXHJcblxyXG4gICAgY3RybC51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBjdHJsLnVwZGF0aW5nKHRydWUpXHJcbiAgICAgICAgbS5yZWRyYXcoKVxyXG4gICAgICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAoc3VjY2VzcykgPT4gY3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyksXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4gY3RybC5lcnJvcihwYXJzZUVycm9yKGVycm9yKSlcclxuICAgICAgICApLnRoZW4oKCkgPT4ge2N0cmwudXBkYXRpbmcoZmFsc2UpOyBtLnJlZHJhdygpfSlcclxuICAgIH1cclxuICAgIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY3RybC51cGRhdGluZyh0cnVlKVxyXG4gICAgICAgIG0ucmVkcmF3KClcclxuICAgICAgICBjdHJsLnZtLm1vZGVsLmNyZWF0ZShjdHJsLnZtLnJlY29yZCkudGhlbihcclxuICAgICAgICAgICAgKHN1Y2Nlc3MpID0+IG0ucm91dGUoXCIvcHJvZHVjdHNcIiksXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5lcnJvcihwYXJzZUVycm9yKGVycm9yKSlcclxuICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpOyBcclxuICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgIH1cclxuICAgIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY3RybC51cGRhdGluZyh0cnVlKVxyXG4gICAgICAgIGN0cmwudm0ubW9kZWwuZGVsZXRlKGN0cmwudm0ucmVjb3JkLmlkKCkpLnRoZW4oXHJcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiBtLnJvdXRlKFwiL3Byb2R1Y3RzXCIpLFxyXG4gICAgICAgICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXHJcbiAgICAgICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XHJcblByb2R1Y3RQYWdlLnZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xyXG5cclxuICAgIC8vY29tcGxldGUgdmlld1xyXG4gICAgcmV0dXJuIG0oXCIjY2F0ZWdvcnlsaXN0XCIsIFtcclxuICAgICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXHJcbiAgICAgICAgY3RybC52bS5yZWNvcmQoKVxyXG4gICAgICAgID8gbSgnZm9ybS5hbmltYXRlZC5mYWRlSW4nLCBbXHJcbiAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xyXG4gICAgICAgICAgICAgICAgbGFiZWxmb3IoJ25hbWUnLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICBpbnB1dGZvcignbmFtZScsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXHJcbiAgICAgICAgICAgICAgICBsYWJlbGZvcignaW1hZ2UnLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICBpbnB1dGZvcignaW1hZ2UnLCBjdHJsLnZtLnJlY29yZCkgLy9maWxlZm9yXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcclxuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdjYXRlZ29yeWlkJywgY3RybC52bS5yZWNvcmQpLFxyXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoQ2F0ZWdvcnlTZWxlY3QsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5jYXRlZ29yeWlkLCBlcnJvcjogY3RybC5lcnJvcn0pXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcclxuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdpc3B1Ymxpc2hlZCcsIGN0cmwudm0ucmVjb3JkKSxcclxuICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdpc3B1Ymxpc2hlZCcsIGN0cmwudm0ucmVjb3JkKSAvL2NoZWNrYm94Zm9yXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcclxuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdwcmljZScsIGN0cmwudm0ucmVjb3JkKSxcclxuICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdwcmljZScsIGN0cmwudm0ucmVjb3JkKVxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXHJcbiAgICAgICAgICAgICAgICBsYWJlbGZvcignZGVzY3JpcHRpb24nLCBjdHJsLnZtLnJlY29yZCksXHJcbiAgICAgICAgICAgICAgICBpbnB1dGZvcignZGVzY3JpcHRpb24nLCBjdHJsLnZtLnJlY29yZCkgLy90ZXh0YXJlYWZvclxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgKGN0cmwubWVzc2FnZSgpKSA/IG0oJy5hY3Rpb24tbWVzc2FnZS5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwubWVzc2FnZSgpKSA6IFwiXCIsXHJcbiAgICAgICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxyXG4gICAgICAgICAgICBtKCcuYWN0aW9ucycsIFtcclxuICAgICAgICAgICAgICAgIChtLnJvdXRlLnBhcmFtKFwiaWRcIikgPT0gXCJuZXdcIilcclxuICAgICAgICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtC30LTQsNGC0YwnKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIDogW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnlbdHlwZT1cInN1Ym1pdFwiXScsIHsgb25jbGljazogY3RybC51cGRhdGUsIGRpc2FibGVkOiBjdHJsLnVwZGF0aW5nKCkgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAn0KHQvtGF0YDQsNC90LjRgtGMJylcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1kYW5nZXInLCB7IG9uY2xpY2s6IGN0cmwuZGVsZXRlLCBkaXNhYmxlZDogY3RybC51cGRhdGluZygpIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaS5mYS5mYS1yZW1vdmUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICfQo9C00LDQu9C40YLRjCcpXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcclxuICAgIF0pXHJcbn0iLCLvu78ndXNlIHN0cmljdCc7XHJcbi8qZ2xvYmFsIG0gKi9cclxuXHJcbmltcG9ydCB7bXJlcXVlc3QsIHBhcnNlRXJyb3IsIGRpc3BsYXlmb3IsIG1ldGFkYXRhLCBpbnB1dGZvciwgcGFnZXMsIHNvcnRzLCBnZXRDb29raWUsIHNldENvb2tpZX0gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcclxuaW1wb3J0IHtNb2RlbH0gZnJvbSBcIi4uL2hlbHBlcnMvbW9kZWxcIlxyXG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gXCIuLi9sYXlvdXQvc3Bpbm5lclwiXHJcbmltcG9ydCB7UGFnZVNpemVTZWxlY3Rvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCJcclxuaW1wb3J0IHtQYWdpbmF0b3J9IGZyb20gXCIuLi9sYXlvdXQvcGFnaW5hdG9yXCJcclxuaW1wb3J0IHtQcm9kdWN0fSBmcm9tIFwiLi9wcm9kdWN0XCJcclxuXHJcbmV4cG9ydCB2YXIgUHJvZHVjdExpc3QgPSB7fVxyXG5Qcm9kdWN0TGlzdC52bSA9IHt9XHJcblByb2R1Y3RMaXN0LnZtLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XHJcbiAgICBhcmdzID0gYXJncyB8fCB7fVxyXG4gICAgdmFyIHZtID0gdGhpc1xyXG4gICAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3Byb2R1Y3RzXCIsIHR5cGU6IFByb2R1Y3R9KVxyXG4gICAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KClcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuUHJvZHVjdExpc3QuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjdHJsID0gdGhpc1xyXG5cclxuICAgIGN0cmwudm0gPSBQcm9kdWN0TGlzdC52bS5pbml0KClcclxuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSkgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXHJcbiAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KSAvL2hpZGUgc3Bpbm5lciBhbmQgcmVkcmF3IGFmdGVyIGRhdGEgYXJyaXZlIFxyXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQodC/0LjRgdC+0Log0YLQvtCy0LDRgNC+0LJcIlxyXG4gICAgY3RybC5wYWdlc2l6ZSA9IG0ucHJvcChnZXRDb29raWUoXCJwYWdlc2l6ZVwiKSB8fCAxMCkgLy9udW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2VcclxuICAgIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCkgLy9jdXJyZW50IHBhZ2UsIHN0YXJ0aW5nIHdpdGggMFxyXG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJylcclxuXHJcbiAgICBjdHJsLnN0YXJ0ZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2UgbS5yb3V0ZSB0byByZWRpcmVjdCcpXHJcbiAgICB9XHJcbiAgICBjdHJsLnN0YXJ0Y3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgbS5yb3V0ZShcIi9wcm9kdWN0cy9uZXdcIilcclxuICAgIH1cclxuICAgIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgY3RybC51cGRhdGluZyh0cnVlKVxyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpIC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcclxuICAgICAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcclxuICAgICAgICAgICAgKHN1Y2Nlc3MpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKVxyXG4gICAgICAgICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5jdXJyZW50cGFnZSgpKzEgPiBwYWdlcyhjdHJsLnZtLmxpc3QoKS5sZW5ndGgsIGN0cmwucGFnZXNpemUoKSkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY3VycmVudHBhZ2UoTWF0aC5tYXgoY3RybC5jdXJyZW50cGFnZSgpLTEsIDApKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSlcclxuICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgIH1cclxufVxyXG5Qcm9kdWN0TGlzdC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcclxuXHJcbiAgICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuaWQoKSksXHJcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsnLCAoZGF0YS5pbWFnZSgpKSA/IG0oJ2ltZy5pbWFnZS1wcmV2aWV3LmltZy1yZXNwb25zaXZlJywge3NyYzogZGF0YS5pbWFnZSgpfSkgOiBcIlwiKSxcclxuICAgICAgICAgICAgICAgIG0oJ3RkJywgZGF0YS5uYW1lKCkpLFxyXG4gICAgICAgICAgICAgICAgbSgndGQuc2hyaW5rJywgZGF0YS5jYXRlZ29yeW5hbWUoKSksXHJcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsudGV4dC1jZW50ZXInLCBkYXRhLmlzcHVibGlzaGVkKCkgPyBtKCdpLmZhLmZhLWNoZWNrJykgOiBtKCdpLmZhLmZhLXRpbWVzJykpLFxyXG4gICAgICAgICAgICAgICAgbSgndGQuc2hyaW5rLmFjdGlvbnMnLFtcclxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIClcclxuICAgIH0gLy9zaG93Um93VGVtcGxhdGVcclxuXHJcbiAgICAvL2NvbXBsZXRlIHZpZXdcclxuICAgIHJldHVybiBtKFwiI3Byb2R1Y3RsaXN0XCIsIFtcclxuICAgICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXHJcbiAgICAgICAgbSgnZGl2JywgW1xyXG4gICAgICAgICAgICBtKCd0YWJsZS50YWJsZS50YWJsZS1zdHJpcGVkLmFuaW1hdGVkLmZhZGVJbicsIHNvcnRzKGN0cmwudm0ubGlzdCgpKSwgW1xyXG4gICAgICAgICAgICAgICAgbSgndGhlYWQnLCBcclxuICAgICAgICAgICAgICAgICAgICBtKCd0cicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgndGguc2hyaW5rLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aWRdJywgJ+KElicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWltYWdlXScsICfQpNC+0YLQvicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PW5hbWVdJywgJ9Cd0LDQt9Cy0LDQvdC40LUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgndGguY2xpY2thYmxlW2RhdGEtc29ydC1ieT1jYXRlZ29yeW5hbWVdJywgJ9Ca0LDRgtC10LPQvtGA0LjRjycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1pc3B1Ymxpc2hlZF0nLCAn0J7Qv9GD0LHQu9C40LrQvtCy0LDQvdCwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5hY3Rpb25zJywgJyMnKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgbSgndGJvZHknLCBcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgcmVjb3JkIGxpc3QgaXMgcmVhZHksIGVsc2Ugc2hvdyBzcGlubmVyXHJcbiAgICAgICAgICAgICAgICAgICAgPyBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2xpY2UgZmlsdGVycyByZWNvcmRzIGZyb20gY3VycmVudCBwYWdlIG9ubHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC52bS5saXN0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNob3dSb3dUZW1wbGF0ZShkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoKSA/IG0uY29tcG9uZW50KFNwaW5uZXIpIDogXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcclxuICAgICAgICAgICAgICAgICksIC8vdGJvZHlcclxuICAgICAgICAgICAgXSksIC8vdGFibGVcclxuICAgICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXHJcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1wcmltYXJ5JywgeyBvbmNsaWNrOiBjdHJsLnN0YXJ0Y3JlYXRlIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcclxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0YLQvtCy0LDRgCcpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXHJcbiAgICAgICAgXSlcclxuICAgIF0pXHJcbn0iXX0=
