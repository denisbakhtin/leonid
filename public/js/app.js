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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYWNjb3VudC9hY2NvdW50LmpzIiwiYXNzZXRzL2pzL2FjY291bnQvbWFuYWdlcGFzc3dvcmQuanMiLCJhc3NldHMvanMvYWNjb3VudC9tYW5hZ2V1c2VyLmpzIiwiYXNzZXRzL2pzL2Rhc2hib2FyZC5qcyIsImFzc2V0cy9qcy9oZWxwZXJzL2Z1bmN0aW9ucy5qcyIsImFzc2V0cy9qcy9oZWxwZXJzL21vZGVsLmpzIiwiYXNzZXRzL2pzL2xheW91dC9sYXlvdXQuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2VzaXplc2VsZWN0b3IuanMiLCJhc3NldHMvanMvbGF5b3V0L3BhZ2luYXRvci5qcyIsImFzc2V0cy9qcy9sYXlvdXQvc3Bpbm5lci5qcyIsImFzc2V0cy9qcy9sYXlvdXQvdGFicy5qcyIsImFzc2V0cy9qcy9tYWluLmpzIiwiYXNzZXRzL2pzL3Byb2R1Y3QvY2F0ZWdvcnlncmlkLmpzIiwiYXNzZXRzL2pzL3Byb2R1Y3QvY2F0ZWdvcnlzZWxlY3QuanMiLCJhc3NldHMvanMvcHJvZHVjdC9wcm9kdWN0LmpzIiwiYXNzZXRzL2pzL3Byb2R1Y3QvcHJvZHVjdGxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQztBQUNEOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRU8sSUFBSSw0QkFBVSxFQUFkO0FBQ1AsUUFBUSxVQUFSLEdBQXFCLFlBQVk7QUFDN0IsUUFBSSxPQUFPLElBQVg7QUFDQSxTQUFLLEtBQUwsR0FBYSxTQUFTLEtBQVQsR0FBaUIsMEJBQTlCO0FBQ0gsQ0FIRDtBQUlBLFFBQVEsSUFBUixHQUFlLFVBQVUsSUFBVixFQUFnQjtBQUMzQixXQUFPLEVBQUUsVUFBRixFQUFjLENBQ2pCLEVBQUUsSUFBRixFQUFRLEtBQUssS0FBYixDQURpQixFQUVqQixFQUFFLFNBQUYsYUFBa0IsQ0FDZCxFQUFDLElBQUksWUFBTCxFQUFt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QixHQUF5QyxFQVgzQyxDQUZGLEdBZUYsRUFBRSxTQUFGLGtCQWhCRixDQVhrRSxDQUF0RSxDQURLLEVBOEJEO0FBQ0osTUFBRSxVQUFGLEVBQWMsQ0FDVixFQUFFLHdCQUFGLEVBQTRCLEVBQUUsU0FBUyxLQUFLLFdBQWhCLEVBQTVCLEVBQTJELENBQ3ZELEVBQUUsY0FBRixDQUR1RCxFQUV2RCxFQUFFLE1BQUYsRUFBVSxnQkFBVixDQUZ1RCxDQUEzRCxDQURVLEVBS1YsRUFBRSxhQUFGLEVBQWlCLEVBQUUsU0FBRixxQ0FBOEIsS0FBSyxRQUFuQyxDQUFqQixDQUxVLENBQWQsQ0EvQkssRUFzQ0wsS0FBSyxFQUFMLENBQVEsSUFBUixLQUFpQixFQUFFLFNBQUYsdUJBQXVCLEVBQUMsTUFBTSxLQUFLLEVBQUwsQ0FBUSxJQUFmLEVBQXFCLFVBQVUsS0FBSyxRQUFwQyxFQUE4QyxhQUFhLEtBQUssV0FBaEUsRUFBNkUsV0FBVyxLQUFLLFdBQTdGLEVBQXZCLENBQWpCLEdBQXFKLEVBdENoSixDQUFULENBRnFCLENBQWxCLENBQVA7QUEyQ0gsQ0E5REQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/J3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuaW1wb3J0IHtUYWJzfSBmcm9tIFwiLi4vbGF5b3V0L3RhYnNcIlxuaW1wb3J0IHtNYW5hZ2VVc2VyfSBmcm9tIFwiLi9tYW5hZ2V1c2VyXCJcbmltcG9ydCB7TWFuYWdlUGFzc3dvcmR9IGZyb20gXCIuL21hbmFnZXBhc3N3b3JkXCJcblxuZXhwb3J0IHZhciBBY2NvdW50ID0ge31cbkFjY291bnQuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3RybCA9IHRoaXNcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCY0LfQvNC10L3QtdC90LjQtSDRg9GH0LXRgtC90L7QuSDQt9Cw0L/QuNGB0LhcIlxufVxuQWNjb3VudC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gbShcIiNhY2NvdW50XCIsIFtcbiAgICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgICBtLmNvbXBvbmVudChUYWJzLCBbXG4gICAgICAgICAgICB7aWQ6IFwibWFuYWdldXNlclwiLCB0aXRsZTogXCLQniDQv9C+0LvRjNC30L7QstCw0YLQtdC70LVcIiwgY29tcG9uZW50OiBNYW5hZ2VVc2VyfSxcbiAgICAgICAgICAgIHtpZDogXCJtYW5hZ2VwYXNzd29yZFwiLCB0aXRsZTogXCLQn9Cw0YDQvtC70YxcIiwgY29tcG9uZW50OiBNYW5hZ2VQYXNzd29yZH1cbiAgICAgICAgXSlcbiAgICBdKVxufVxuIiwi77u/J3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuaW1wb3J0IHttcmVxdWVzdCwgbWV0YWRhdGEsIGxhYmVsZm9yLCBpbnB1dGZvciwgam9pbkVycm9yc30gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSBcIi4uL2xheW91dC9zcGlubmVyXCJcblxudmFyIFBhc3N3b3JkID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgZGF0YSA9IGRhdGEgfHwge31cbiAgICB0aGlzLmN1cnJlbnRwYXNzd29yZCA9IG0ucHJvcChkYXRhLmN1cnJlbnRQYXNzd29yZHx8ICcnKVxuICAgIHRoaXMucGFzc3dvcmQgPSBtLnByb3AoZGF0YS5wYXNzd29yZHx8ICcnKVxuICAgIHRoaXMucGFzc3dvcmRjb25maXJtID0gbS5wcm9wKGRhdGEucGFzc3dvcmRDb25maXJtIHx8ICcnKVxuICAgIHRoaXMubWV0YSA9IG0ucHJvcChtZXRhZGF0YShkYXRhLm1ldGEpKVxuICAgIHRoaXMuX19SZXF1ZXN0VmVyaWZpY2F0aW9uVG9rZW4gPSBtLnByb3AoZ2V0dG9rZW4oKSlcbn1cblxuZXhwb3J0IHZhciBNYW5hZ2VQYXNzd29yZCA9IHt9XG5NYW5hZ2VQYXNzd29yZC52bSA9IHt9XG5NYW5hZ2VQYXNzd29yZC52bS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZWNvcmQgPSBtcmVxdWVzdCh7IGJhY2tncm91bmQ6IHRydWUsIG1ldGhvZDogXCJHRVRcIiwgdXJsOiBcIi9hcGkvbWFuYWdlcGFzc3dvcmRcIiwgdHlwZTogUGFzc3dvcmQgfSlcbiAgICB0aGlzLnJlY29yZC50aGVuKG0ucmVkcmF3KVxuICAgIHJldHVybiB0aGlzXG59XG5NYW5hZ2VQYXNzd29yZC5jb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdHJsID0gdGhpc1xuICAgIGN0cmwudm0gPSBNYW5hZ2VQYXNzd29yZC52bS5pbml0KClcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCY0LfQvNC10L3QuNGC0Ywg0L/QsNGA0L7Qu9GMXCJcbiAgICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpIC8vbm90aWZpY2F0aW9uc1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpIC8vcmVxdWVzdCBlcnJvcnNcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKSAvL3JlcXVlc3QgaXMgYmVpbmcgcHJvY2Vzc2VkIChzaG93IHNwaW5uZXIgJiBwcmV2ZW50IGRvdWJsZSBjbGljaylcbiAgICBjdHJsLm9uc3VibWl0ID0gZnVuY3Rpb24ocmVjb3JkKSB7XG4gICAgICAgIGlmIChjdHJsLnVwZGF0aW5nKCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgLy8gcHJldmVudCBkb3VibGUgZXZlbnQgcHJvY2Vzc2luZ1xuICAgICAgICBjdHJsLm1lc3NhZ2UoJycpXG4gICAgICAgIGN0cmwuZXJyb3IoJycpXG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcbiAgICAgICAgbS5yZWRyYXcoKVxuICAgICAgICBtcmVxdWVzdCh7IG1ldGhvZDogXCJQVVRcIiwgdXJsOiBcIi9hcGkvbWFuYWdlcGFzc3dvcmRcIiwgZGF0YTogcmVjb3JkKCkgfSkudGhlbihcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7IGN0cmwudXBkYXRpbmcoZmFsc2UpOyBjdHJsLm1lc3NhZ2UoJ9CY0LfQvNC10L3QtdC90LjRjyDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnKSB9LFxuICAgICAgICAgICAgKGVycm9yKSA9PiB7IGN0cmwudXBkYXRpbmcoZmFsc2UpOyBjdHJsLmVycm9yKFwi0J7RiNC40LHQutCwISBcIiArIGpvaW5FcnJvcnMoZXJyb3IpKSB9XG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIGZhbHNlIC8vcHJldmVudERlZmF1bHRcbiAgICB9XG59XG5NYW5hZ2VQYXNzd29yZC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gbShcIiNtYW5hZ2VwYXNzd29yZFwiLCBbXG4gICAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgICAgY3RybC52bS5yZWNvcmQoKSBcbiAgICAgICAgPyBtKCdmb3JtLmFuaW1hdGVkLmZhZGVJbicsIFtcbiAgICAgICAgICAgIG0oJy5yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdjdXJyZW50cGFzc3dvcmQnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdjdXJyZW50cGFzc3dvcmQnLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ3Bhc3N3b3JkJywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcigncGFzc3dvcmQnLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ3Bhc3N3b3JkY29uZmlybScsIGN0cmwudm0ucmVjb3JkKSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ3Bhc3N3b3JkY29uZmlybScsIGN0cmwudm0ucmVjb3JkKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxuICAgICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLm9uc3VibWl0LmJpbmQodGhpcywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogY3RybC51cGRhdGluZygpLFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7RhdGA0LDQvdC40YLRjCcpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcbiAgICBdKVxufVxuIiwi77u/J3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuaW1wb3J0IHttcmVxdWVzdCwgbWV0YWRhdGEsIGxhYmVsZm9yLCBpbnB1dGZvciwgam9pbkVycm9yc30gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSBcIi4uL2xheW91dC9zcGlubmVyXCJcblxudmFyIFVzZXIgPSBmdW5jdGlvbihkYXRhKXtcbiAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgIHRoaXMuZW1haWwgPSBtLnByb3AoZGF0YS5lbWFpbHx8ICcnKVxuICAgIHRoaXMuZmlyc3RuYW1lID0gbS5wcm9wKGRhdGEuZmlyc3ROYW1lIHx8ICcnKVxuICAgIHRoaXMubGFzdG5hbWUgPSBtLnByb3AoZGF0YS5sYXN0TmFtZSB8fCAnJylcbiAgICB0aGlzLm1pZGRsZW5hbWUgPSBtLnByb3AoZGF0YS5taWRkbGVOYW1lIHx8ICcnKVxuICAgIHRoaXMuYmlydGhkYXRlID0gbS5wcm9wKCAoZGF0YS5iaXJ0aERhdGUpID8gZGF0YS5iaXJ0aERhdGUuc3BsaXQoJ1QnKVswXSA6ICcnKVxuICAgIHRoaXMuY291bnRyeSA9IG0ucHJvcChkYXRhLmNvdW50cnkgfHwgJycpXG4gICAgdGhpcy5jaXR5ID0gbS5wcm9wKGRhdGEuY2l0eSB8fCAnJylcbiAgICB0aGlzLmFkZHJlc3MgPSBtLnByb3AoZGF0YS5hZGRyZXNzIHx8ICcnKVxuICAgIHRoaXMuemlwID0gbS5wcm9wKGRhdGEuemlwIHx8ICcnKVxuICAgIHRoaXMuY29tcGFueSA9IG0ucHJvcChkYXRhLmNvbXBhbnkgfHwgJycpXG4gICAgdGhpcy5wb3NpdGlvbiA9IG0ucHJvcChkYXRhLnBvc2l0aW9ufHwgJycpXG4gICAgdGhpcy5pbnRlcmVzdHMgPSBtLnByb3AoZGF0YS5pbnRlcmVzdHMgfHwgJycpXG4gICAgdGhpcy5tZXRhID0gbS5wcm9wKG1ldGFkYXRhKGRhdGEubWV0YSkpXG4gICAgdGhpcy5fX1JlcXVlc3RWZXJpZmljYXRpb25Ub2tlbiA9IG0ucHJvcChnZXR0b2tlbigpKVxufVxuXG5leHBvcnQgdmFyIE1hbmFnZVVzZXIgPSB7fVxuTWFuYWdlVXNlci52bSA9IHt9XG5NYW5hZ2VVc2VyLnZtLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlY29yZCA9IG1yZXF1ZXN0KHsgYmFja2dyb3VuZDogdHJ1ZSwgbWV0aG9kOiBcIkdFVFwiLCB1cmw6IFwiL2FwaS9tYW5hZ2V1c2VyXCIsIHR5cGU6IFVzZXIgfSlcbiAgICB0aGlzLnJlY29yZC50aGVuKG0ucmVkcmF3KVxuICAgIHJldHVybiB0aGlzXG59XG5NYW5hZ2VVc2VyLmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzXG4gICAgY3RybC52bSA9IE1hbmFnZVVzZXIudm0uaW5pdCgpXG4gICAgY3RybC50aXRsZSA9IGRvY3VtZW50LnRpdGxlID0gXCLQlNCw0L3QvdGL0LUg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXCJcbiAgICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoJycpIC8vbm90aWZpY2F0aW9uc1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpIC8vcmVxdWVzdCBlcnJvcnNcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKGZhbHNlKSAvL3JlcXVlc3QgaXMgYmVpbmcgcHJvY2Vzc2VkIChzaG93IHNwaW5uZXIgJiBwcmV2ZW50IGRvdWJsZSBjbGljaylcbiAgICBjdHJsLm9uc3VibWl0ID0gZnVuY3Rpb24ocmVjb3JkKSB7XG4gICAgICAgIGlmIChjdHJsLnVwZGF0aW5nKCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgLy8gcHJldmVudCBkb3VibGUgZXZlbnQgcHJvY2Vzc2luZ1xuICAgICAgICBjdHJsLm1lc3NhZ2UoJycpXG4gICAgICAgIGN0cmwuZXJyb3IoJycpXG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcbiAgICAgICAgbS5yZWRyYXcoKVxuICAgICAgICBtcmVxdWVzdCh7IG1ldGhvZDogXCJQVVRcIiwgdXJsOiBcIi9hcGkvbWFuYWdldXNlclwiLCBkYXRhOiByZWNvcmQoKX0pLnRoZW4oXG4gICAgICAgICAgICAoc3VjY2VzcykgPT4geyBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgY3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJykgfSxcbiAgICAgICAgICAgIChlcnJvcikgPT4geyBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgY3RybC5lcnJvcihcItCe0YjQuNCx0LrQsCEgXCIgKyBqb2luRXJyb3JzKGVycm9yKSkgfVxuICAgICAgICApXG4gICAgICAgIHJldHVybiBmYWxzZSAvL3ByZXZlbnREZWZhdWx0XG4gICAgfVxufVxuTWFuYWdlVXNlci52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gbShcIiNtYW5hZ2V1c2VyXCIsIFtcbiAgICAgICAgbShcImgxXCIsIGN0cmwudGl0bGUpLFxuICAgICAgICBjdHJsLnZtLnJlY29yZCgpIFxuICAgICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICAgICAgbSgnLnJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2VtYWlsJywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcignZW1haWwnLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2JpcnRoZGF0ZScsIGN0cmwudm0ucmVjb3JkKSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2JpcnRoZGF0ZScsIGN0cmwudm0ucmVjb3JkKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcucm93JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwLmNvbC1tZC00JywgW1xuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignZmlyc3RuYW1lJywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcignZmlyc3RuYW1lJywgY3RybC52bS5yZWNvcmQpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdtaWRkbGVuYW1lJywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dGZvcignbWlkZGxlbmFtZScsIGN0cmwudm0ucmVjb3JkKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwLmNvbC1tZC00JywgW1xuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignbGFzdG5hbWUnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdsYXN0bmFtZScsIGN0cmwudm0ucmVjb3JkKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcucm93JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwLmNvbC1tZC00JywgW1xuICAgICAgICAgICAgICAgICAgICBsYWJlbGZvcignY291bnRyeScsIGN0cmwudm0ucmVjb3JkKSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2NvdW50cnknLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2NpdHknLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdjaXR5JywgY3RybC52bS5yZWNvcmQpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsZm9yKCd6aXAnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCd6aXAnLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2FkZHJlc3MnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2FkZHJlc3MnLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9ybS1ncm91cC5jb2wtbWQtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2NvbXBhbnknLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdjb21wYW55JywgY3RybC52bS5yZWNvcmQpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAuY29sLW1kLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdwb3NpdGlvbicsIGN0cmwudm0ucmVjb3JkKSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRmb3IoJ3Bvc2l0aW9uJywgY3RybC52bS5yZWNvcmQpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdpbnRlcmVzdHMnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgaW5wdXRmb3IoJ2ludGVyZXN0cycsIGN0cmwudm0ucmVjb3JkKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxuICAgICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLm9uc3VibWl0LmJpbmQodGhpcywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogY3RybC51cGRhdGluZygpLFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwudXBkYXRpbmcoKSkgPyBtKCdpLmZhLmZhLXNwaW4uZmEtcmVmcmVzaCcpIDogbSgnaS5mYS5mYS1jaGVjaycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7RhdGA0LDQvdC40YLRjCcpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIsIHtzdGFuZGFsb25lOiB0cnVlfSlcbiAgICBdKVxufVxuIiwi77u/J3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG5leHBvcnQgdmFyIGRhc2hib2FyZCA9IHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiXG4gICAgICAgIHJldHVybiB7IHRpdGxlOiBcIkRhc2hib2FyZCBUaXRsZSAkMVwiIH1cbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uIChjdHJsKSB7XG4gICAgICAgIHJldHVybiBtKFwiaDFcIiwgY3RybC50aXRsZSlcbiAgICB9XG59Iiwi77u/J3VzZSBzdHJpY3QnXG5cbi8vdGFibGUgbWV0YWRhdGFcbnZhciBNZXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhIHx8IHt9XG4gICAgdmFyIG1lID0gdGhpc1xuICAgIG1lLm5hbWUgPSBkYXRhLnByb3BlcnR5TmFtZSB8fCBcIlwiXG4gICAgbWUuZGlzcGxheW5hbWUgPSBkYXRhLmRpc3BsYXlOYW1lIHx8IFwiXCJcbiAgICBtZS50eXBlID0gZGF0YS5kYXRhVHlwZU5hbWUgfHwgXCJcIlxuICAgIG1lLmlzcmVxdWlyZWQgPSBkYXRhLmlzUmVxdWlyZWQgfHwgZmFsc2VcbiAgICBtZS5pc3JlYWRvbmx5ID0gZGF0YS5pc1JlYWRPbmx5IHx8IGZhbHNlXG4gICAgbWUucGxhY2Vob2xkZXIgPSBkYXRhLnBsYWNlaG9sZGVyIHx8IFwiXCJcbn1cblxuZXhwb3J0IHZhciBjb25maWcgPSB7XG4gICAgYnJhbmQ6IFwi0JrQsNGC0LDQu9C+0LMg0J/QoNCeXCIsXG4gICAgYnJhbmRBZG1pbjogXCLQn9Cw0L3QtdC70Ywg0LDQtNC80LjQvdC40YHRgtGA0LDRgtC+0YDQsFwiXG59IFxuXG5leHBvcnQgdmFyIG1ldGFkYXRhID0gZnVuY3Rpb24obWV0YSkge1xuICAgIGxldCBtZSA9IFtdXG4gICAgaWYgKG1ldGEpIHtcbiAgICAgICAgZm9yIChsZXQgZCBvZiBtZXRhKSB7XG4gICAgICAgICAgICBtZS5wdXNoKG5ldyBNZXRhKGQpKVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZVxufVxuXG4vL25hbWUgaXMgYSBzdHJpbmcgbmFtZSBvZiBwcm9wZXJ0eSBpbiBtb2RlbFxuLy9tb2RlbCAtIHJlcHJlc2VudHMgdGFibGUgcmVjb3JkLCBzaG91bGQgY29udGFpbiAnbWV0YScgcHJvcGVydHkgd2l0aCB0YWJsZSBtZXRhZGF0YSBkZXNjcmlwdGlvblxuZXhwb3J0IHZhciBsYWJlbGZvciA9IGZ1bmN0aW9uKG5hbWUsIG1vZGVsKSB7XG4gICAgaWYgKG1vZGVsICYmIHR5cGVvZihtb2RlbCkgPT0gXCJmdW5jdGlvblwiICYmIG1vZGVsKCkubWV0YSkge1xuICAgICAgICBmb3IgKGxldCBtZSBvZiBtb2RlbCgpLm1ldGEoKSkge1xuICAgICAgICAgICAgaWYgKG1lLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBtKCdsYWJlbCcsIHtcImZvclwiOiBcIiNcIituYW1lfSwgKG1lLmRpc3BsYXluYW1lKSA/IG1lLmRpc3BsYXluYW1lIDogbmFtZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbSgnbGFiZWwnLCB7XCJmb3JcIjogXCIjXCIrbmFtZX0sIG5hbWUpXG59XG5cbmV4cG9ydCB2YXIgaW5wdXRmb3IgPSBmdW5jdGlvbihuYW1lLCBtb2RlbCkge1xuICAgIGlmIChtb2RlbCAmJiB0eXBlb2YobW9kZWwpID09IFwiZnVuY3Rpb25cIiAmJiBtb2RlbCgpLm1ldGEpIHtcbiAgICAgICAgZm9yIChsZXQgbWUgb2YgbW9kZWwoKS5tZXRhKCkpIHtcbiAgICAgICAgICAgIGlmIChtZS5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnaW5wdXQuZm9ybS1jb250cm9sJywge1xuICAgICAgICAgICAgICAgICAgICBpZDogbmFtZSwgXG4gICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiAobWUuaXNyZWFkb25seSkgPyBudWxsIDogbS53aXRoQXR0cihcInZhbHVlXCIsIG1vZGVsKClbbmFtZV0pLCBcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG1vZGVsKClbbmFtZV0oKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IG1lLmlzcmVhZG9ubHksXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBtZS5pc3JlcXVpcmVkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpbnB1dFR5cGUobWUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbSgnaW5wdXQuZm9ybS1jb250cm9sJywge2lkOiBuYW1lfSlcbn1cblxuZXhwb3J0IHZhciBkaXNwbGF5Zm9yID0gZnVuY3Rpb24obmFtZSwgbW9kZWwpIHtcbiAgICBpZiAobW9kZWwgJiYgdHlwZW9mKG1vZGVsKSA9PSBcImZ1bmN0aW9uXCIgJiYgbW9kZWwoKS5tZXRhKSB7XG4gICAgICAgIGZvciAobGV0IG1lIG9mIG1vZGVsKCkubWV0YSgpKSB7XG4gICAgICAgICAgICBpZiAobWUubmFtZS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIChtZS5kaXNwbGF5bmFtZSkgPyBtZS5kaXNwbGF5bmFtZSA6IG5hbWVcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmFtZVxufVxuXG5mdW5jdGlvbiBpbnB1dFR5cGUobWUpIHtcbiAgICBzd2l0Y2gobWUudHlwZSkge1xuICAgICAgICBjYXNlIFwiRW1haWxBZGRyZXNzXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJlbWFpbFwiXG4gICAgICAgIGNhc2UgXCJEYXRlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJkYXRlXCJcbiAgICAgICAgY2FzZSBcIlBhc3N3b3JkXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJwYXNzd29yZFwiXG4gICAgICAgIGRlZmF1bHQ6IFxuICAgICAgICAgICAgcmV0dXJuICcnXG4gICAgfVxufVxuXG5leHBvcnQgdmFyIHBhcnNlRXJyb3IgPSBmdW5jdGlvbihlcnJzdHIpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gam9pbkVycm9ycyhKU09OLnBhcnNlKGVycnN0cikpXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgICByZXR1cm4gZXJyc3RyIC8vcmV0dXJuIGFzIGlzXG4gICAgfVxufVxuXG5leHBvcnQgdmFyIGpvaW5FcnJvcnMgPSBmdW5jdGlvbihlcnJvcnMpIHtcbiAgICBpZiAodHlwZW9mKGVycm9ycykgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgbGV0IGVycnN0ciA9IFwiXCI7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBlcnJvcnMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YoZXJyb3JzW2tleV0pID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZWtleSBpbiBlcnJvcnNba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJzdHIgKz0gZXJyb3JzW2tleV1bZWtleV0gKyBcIi4gXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVycnN0clxuICAgIH0gZWxzZSBcbiAgICAgICAgcmV0dXJuIGVycm9ycyBcbn1cblxuZXhwb3J0IHZhciBwYWdlcyA9IGZ1bmN0aW9uKGFybGVuLCBwYWdlc2l6ZSkge1xuICAgIHJldHVybiBBcnJheShNYXRoLmZsb29yKGFybGVuL3BhZ2VzaXplKSArICgoYXJsZW4lcGFnZXNpemUgPiAwKSA/IDEgOiAwKSkuZmlsbCgwKTsgLy9yZXR1cm4gZW1wdHkgYXJyYXkgb2YgcGFnZXNcbn1cblxuZXhwb3J0IHZhciBzb3J0cyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcHJvcCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1ieVwiKVxuICAgICAgICAgICAgaWYgKHByb3ApIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3QgPSBsaXN0WzBdXG4gICAgICAgICAgICAgICAgbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFbcHJvcF0oKSA+IGJbcHJvcF0oKSA/IDEgOiBhW3Byb3BdKCkgPCBiW3Byb3BdKCkgPyAtMSA6IDBcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGlmIChmaXJzdCA9PT0gbGlzdFswXSkgbGlzdC5yZXZlcnNlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHZhciBtcmVxdWVzdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB2YXIgbm9uSnNvbkVycm9ycyA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgICByZXR1cm4gKHhoci5zdGF0dXMgPiAyMDQgJiYgeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGgpIFxuICAgICAgICAgICAgPyBKU09OLnN0cmluZ2lmeSh4aHIucmVzcG9uc2VUZXh0KSBcbiAgICAgICAgICAgIDogKHhoci5yZXNwb25zZVRleHQubGVuZ3RoKVxuICAgICAgICAgICAgPyB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgICAgICA6IG51bGxcbiAgICB9XG4gICAgYXJncy5leHRyYWN0ID0gbm9uSnNvbkVycm9yc1xuICAgIHJldHVybiBtLnJlcXVlc3QoYXJncylcbn1cblxuZXhwb3J0IHZhciBzZXRDb29raWUgPSBmdW5jdGlvbihjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKGV4ZGF5cyoyNCo2MCo2MCoxMDAwKSk7XG4gICAgdmFyIGV4cGlyZXMgPSBcImV4cGlyZXM9XCIrIGQudG9VVENTdHJpbmcoKTtcbiAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG59XG5cbmV4cG9ydCB2YXIgZ2V0Q29va2llID0gZnVuY3Rpb24oY25hbWUpIHtcbiAgICB2YXIgbmFtZSA9IGNuYW1lICsgXCI9XCI7XG4gICAgdmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8Y2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBjYVtpXTtcbiAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApPT0nICcpIHtcbiAgICAgICAgICAgIGMgPSBjLnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCxjLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFwiXCI7XG59Iiwi77u/J3VzZSBzdHJpY3QnXG5cbmltcG9ydCB7bXJlcXVlc3R9IGZyb20gXCIuL2Z1bmN0aW9uc1wiXG5cbi8vYXJnczoge3VybDogXCIvYXBpL2V4YW1wbGVcIiwgdHlwZTogT2JqZWN0VHlwZX1cbmV4cG9ydCB2YXIgTW9kZWwgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MgfHwge31cbiAgICB2YXIgbW9kZWwgPSB0aGlzXG5cbiAgICBtb2RlbC5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIiwgXG4gICAgICAgICAgICB1cmw6IGFyZ3MudXJsLCBcbiAgICAgICAgICAgIHR5cGU6IGFyZ3MudHlwZVxuICAgICAgICB9KVxuICAgIH1cbiAgICBtb2RlbC5nZXQgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIiwgXG4gICAgICAgICAgICB1cmw6IGFyZ3MudXJsICsgXCIvXCIgKyBpZCxcbiAgICAgICAgICAgIHR5cGU6IGFyZ3MudHlwZVxuICAgICAgICB9KVxuICAgIH1cbiAgICBtb2RlbC5jcmVhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBtcmVxdWVzdCAoe1xuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IGFyZ3MudXJsLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgbW9kZWwudXBkYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgICAgICAgIHVybDogYXJncy51cmwsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB9KVxuICAgIH1cbiAgICBtb2RlbC5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gbXJlcXVlc3Qoe1xuICAgICAgICAgICAgYmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgICAgICAgIHVybDogYXJncy51cmwgKyBcIi9cIiArIGlkLFxuICAgICAgICB9KVxuICAgIH1cbn1cblxuIiwi77u/J3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2NvbmZpZ30gZnJvbSAnLi4vaGVscGVycy9mdW5jdGlvbnMnXG5cbmZ1bmN0aW9uIGxheW91dChjb21wb25lbnQpIHtcbiAgICBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gICAgICAgIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLCBcbiAgICAgICAgICAgIHVybDogXCIvYXBpL2xvZ09mZlwiLCBcbiAgICAgICAgfSkudGhlbigoc3VjY2VzcykgPT4ge3dpbmRvdy5sb2NhdGlvbiA9IFwiL1wiO30pXG4gICAgfVxuXG4gICAgdmFyIGhlYWRlciA9IG0oXCJuYXYubmF2YmFyLm5hdmJhci1kZWZhdWx0XCIsIFtcbiAgICAgICAgbSgnLmNvbnRhaW5lci1mbHVpZCcsIFtcbiAgICAgICAgICAgIG0oJy5uYXZiYXItaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5uYXZiYXItdG9nZ2xlLmNvbGxhcHNlZFt0eXBlPVwiYnV0dG9uXCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGRhdGEtdGFyZ2V0PVwiI25hdmJhci1jb2xsYXBzZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5zci1vbmx5JywgXCJUb2dnbGUgbmF2aWdhdGlvblwiKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5pY29uLWJhcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmljb24tYmFyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uaWNvbi1iYXInKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJ2EubmF2YmFyLWJyYW5kW2hyZWY9XCIjXCJdJywgY29uZmlnLmJyYW5kQWRtaW4pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5jb2xsYXBzZSBuYXZiYXItY29sbGFwc2UjbmF2YmFyLWNvbGxhcHNlJywgW1xuICAgICAgICAgICAgICAgIG0oJ3VsLm5hdi5uYXZiYXItbmF2Lm5hdmJhci1yaWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnbGknLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9cIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaS5mYS5mYS1wbGF5JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIFwi0KHQsNC50YJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2xpJywgXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCIjXCJdJywge29uY2xpY2s6IGxvZ291dH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXNpZ24tb3V0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIFwi0JLRi9C50YLQuFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgIF0pXG5cbiAgICB2YXIgbmF2bGluayA9IGZ1bmN0aW9uICh1cmwsIHRpdGxlKSB7XG4gICAgICAgIHJldHVybiBtKCdsaScsIHsgY2xhc3M6IChtLnJvdXRlKCkuaW5jbHVkZXModXJsKSkgPyBcImFjdGl2ZVwiIDogXCJcIiB9LCBtKCdhJywgeyBocmVmOiB1cmwsIGNvbmZpZzogbS5yb3V0ZSB9LCB0aXRsZSkpXG4gICAgfVxuICAgIHZhciBzaWRlYmFyID0gW1xuICAgICAgICBtKCcucGFuZWwucGFuZWwtZGVmYXVsdCcsIFtcbiAgICAgICAgICAgIG0oJ3VsLm5hdiBuYXYtcGlsbHMgbmF2LXN0YWNrZWQnLCBbXG4gICAgICAgICAgICAgICAgbmF2bGluayhcIi9jYXRlZ29yaWVzXCIsIFwi0JrQsNGC0LXQs9C+0YDQuNC4INGC0L7QstCw0YDQvtCyXCIpLFxuICAgICAgICAgICAgICAgIG5hdmxpbmsoXCIvcHJvZHVjdHNcIiwgXCLQotC+0LLQsNGA0YtcIiksXG4gICAgICAgICAgICAgICAgbmF2bGluayhcIi9hY2NvdW50XCIsIFwi0KPRh9C10YLQvdCw0Y8g0LfQsNC/0LjRgdGMXCIpLFxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICBdXG5cbiAgICB2YXIgZm9vdGVyID0gW1xuICAgICAgICBtKCdmb290ZXIjZm9vdGVyJywgW1xuICAgICAgICAgICAgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICBtKCdkaXYnLCBcItCf0L7QtNCy0LDQuyDRgdCw0LnRgtCwXCIpXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgIF1cbiAgICByZXR1cm4gW1xuICAgICAgICBoZWFkZXIsXG4gICAgICAgIG0oXCIjY29udGVudC13cmFwcGVyLmNvbnRhaW5lclwiLCBbXG4gICAgICAgICAgICBtKCcjc2lkZWJhcicsIHNpZGViYXIpLFxuICAgICAgICAgICAgbSgnI2NvbnRlbnQnLCBtLmNvbXBvbmVudChjb21wb25lbnQpKVxuICAgICAgICBdKSxcbiAgICAgICAgZm9vdGVyXG4gICAgXTtcbn07XG5cbmZ1bmN0aW9uIG1peGluTGF5b3V0KGxheW91dCwgY29tcG9uZW50KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxheW91dChjb21wb25lbnQpO1xuICAgIH07XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gd2l0aExheW91dChjb21wb25lbnQpIHtcbiAgICByZXR1cm4geyBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7IH0sIHZpZXc6IG1peGluTGF5b3V0KGxheW91dCwgY29tcG9uZW50KSB9XG59Iiwi77u/J3VzZSBzdHJpY3QnXG5cbmltcG9ydCB7c2V0Q29va2llfSBmcm9tIFwiLi4vaGVscGVycy9mdW5jdGlvbnNcIlxuZXhwb3J0IHZhciBQYWdlU2l6ZVNlbGVjdG9yID0ge31cblxuLy9hcmcgaXMgYW4gbS5wcm9wIG9mIHBhZ2VzaXplIGluIHRoZSBwYXJlbnQgY29udHJvbGxlclxuUGFnZVNpemVTZWxlY3Rvci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzXG4gICAgY3RybC5zZXRwYWdlc2l6ZSA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgYXJnKHNpemUpXG4gICAgICAgIHNldENvb2tpZShcInBhZ2VzaXplXCIsIHNpemUsIDM2NSkgLy9zdG9yZSBwYWdlc2l6ZSBpbiBjb29raWVzXG4gICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5QYWdlU2l6ZVNlbGVjdG9yLnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmcpIHtcbiAgICByZXR1cm4gbSgnI3BhZ2VzaXplc2VsZWN0b3InLCBbXG4gICAgICAgIG0oJ3NwYW4nLCBcItCf0L7QutCw0LfRi9Cy0LDRgtGMINC90LAg0YHRgtGA0LDQvdC40YbQtTogXCIpLFxuICAgICAgICBbMTAsIDUwLCAxMDAsIDUwMF0ubWFwKGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCdhW2hyZWY9I10nLCB7Y2xhc3M6IChzaXplID09IGFyZygpKSA/ICdhY3RpdmUnIDogJycsIG9uY2xpY2s6IGN0cmwuc2V0cGFnZXNpemUuYmluZCh0aGlzLCBzaXplKX0sIHNpemUpXG4gICAgICAgIH0pXG4gICAgXSlcbn0iLCLvu78ndXNlIHN0cmljdCdcblxuaW1wb3J0IHtwYWdlc30gZnJvbSAnLi4vaGVscGVycy9mdW5jdGlvbnMnXG5leHBvcnQgdmFyIFBhZ2luYXRvciA9IHt9XG5cblBhZ2luYXRvci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICAgIHZhciBjdHJsID0gdGhpc1xuICAgIGN0cmwuc2V0cGFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIGFyZ3Mub25zZXRwYWdlKGluZGV4KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG59XG5cblBhZ2luYXRvci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgIHJldHVybiBtKCcjcGFnaW5hdG9yJywgXG4gICAgICAgIChhcmdzLmxpc3QoKS5sZW5ndGggPiBhcmdzLnBhZ2VzaXplKCkpXG4gICAgICAgID8gbSgnbmF2JywgW1xuICAgICAgICAgICAgbSgndWwucGFnaW5hdGlvbicsIFxuICAgICAgICAgICAgICAgIHBhZ2VzKGFyZ3MubGlzdCgpLmxlbmd0aCwgYXJncy5wYWdlc2l6ZSgpKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24ocCwgaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCB7Y2xhc3M6IChpbmRleCA9PSBhcmdzLmN1cnJlbnRwYWdlKCkpID8gJ2FjdGl2ZScgOiAnJ30sIFxuICAgICAgICAgICAgICAgICAgICAgICAgKGluZGV4ID09IGFyZ3MuY3VycmVudHBhZ2UoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbSgnc3BhbicsIGluZGV4KzEpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG0oJ2FbaHJlZj0vXScsIHtvbmNsaWNrOiBjdHJsLnNldHBhZ2UuYmluZCh0aGlzLCBpbmRleCl9LCBpbmRleCsxKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgICAgOiBcIlwiXG4gICAgKVxufSIsIu+7vyd1c2Ugc3RyaWN0J1xuXG52YXIgTG9hZGluZ1NwaW5uZXIgPSB7fVxuXG5Mb2FkaW5nU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oKSB7fVxuTG9hZGluZ1NwaW5uZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICByZXR1cm4gbSgnI2xvYWRpbmctc3Bpbm5lci5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICAgIG0oJ3AudGV4dC1jZW50ZXInLCBtKCdpLmZhLmZhLXNwaW4uZmEtY29nLmZhLTN4JykpLFxuICAgICAgICBtKCdwLnRleHQtY2VudGVyJywgJ9Cf0L7QtNC+0LbQtNC40YLQtSwg0LjQtNC10YIg0LfQsNCz0YDRg9C30LrQsC4uLicpXG4gICAgXSlcbn1cblxudmFyIFVwZGF0aW5nU3Bpbm5lciA9IHt9XG5cblVwZGF0aW5nU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge31cblVwZGF0aW5nU3Bpbm5lci52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgIHJldHVybiBtKCcjdXBkYXRpbmctc3Bpbm5lci5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICAgIG0oJ3Ajc3Bpbm5lci10ZXh0JywgbSgnaS5mYS5mYS1zcGluLmZhLWNvZy5mYS0zeCcpKSxcbiAgICBdKVxufVxuXG5leHBvcnQgdmFyIFNwaW5uZXIgPSB7fVxuU3Bpbm5lci5jb250cm9sbGVyID0gZnVuY3Rpb24oYXJncykge1xuICAgIHZhciBjdHJsID0gdGhpc1xuICAgIGN0cmwuc3RhbmRhbG9uZSA9IChhcmdzICYmIGFyZ3Muc3RhbmRhbG9uZSkgPyB0cnVlIDogZmFsc2U7XG59XG5TcGlubmVyLnZpZXcgPSBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgcmV0dXJuIG0oJyNzcGlubmVyJywgXG4gICAgICAgIChjdHJsLnN0YW5kYWxvbmUpIFxuICAgICAgICA/IG0uY29tcG9uZW50KExvYWRpbmdTcGlubmVyKSBcbiAgICAgICAgOiBtLmNvbXBvbmVudChVcGRhdGluZ1NwaW5uZXIpXG4gICAgKVxufSIsIu+7vyd1c2Ugc3RyaWN0J1xuXG5leHBvcnQgdmFyIFRhYnMgPSB7fVxuXG4vL2FyZ3MgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyB7aWQ6IFwidGFiIGlkXCIsIHRpdGxlOiBcInRhYiB0aXRsZVwiLCBjb21wb25lbnQ6IFwiY29tcG9uZW50IHRvIGJlIHJlbmRlcmVkIGluIHRoYXQgdGFiXCJ9XG5UYWJzLmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzXG4gICAgY3RybC5hY3RpdmUgPSBtLnByb3AoYXJnc1swXS5pZClcbiAgICBjdHJsLnNldGFjdGl2ZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGN0cmwuYWN0aXZlKGlkKVxuICAgIH1cbn1cblxuVGFicy52aWV3ID0gZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgIHJldHVybiBtKCcudGFicycsIFtcbiAgICAgICAgbSgndWwubmF2Lm5hdi10YWJzW3JvbGU9XCJ0YWJsaXN0XCJdJywgXG4gICAgICAgICAgICBhcmdzLm1hcChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpW3JvbGU9XCJwcmVzZW50YXRpb25cIl0nLCBcbiAgICAgICAgICAgICAgICAgICAge2NsYXNzOiAoY3RybC5hY3RpdmUoKSA9PSBkYXRhLmlkKSA/IFwiYWN0aXZlXCIgOiBcIlwifSwgXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1jb250cm9sc1wiOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogXCJ0YWJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS10b2dnbGVcIjogXCJ0YWJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY6IFwiI1wiICsgZGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2V0YWN0aXZlLmJpbmQodGhpcywgZGF0YS5pZCksXG4gICAgICAgICAgICAgICAgICAgIH0sIGRhdGEudGl0bGUpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKSxcbiAgICAgICAgbSgnLnRhYi1jb250ZW50JywgXG4gICAgICAgICAgICBhcmdzLm1hcChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjdHJsLmFjdGl2ZSgpID09IGRhdGEuaWQpXG4gICAgICAgICAgICAgICAgICAgID8gbSgnLnRhYi1wYW5lLmFjdGl2ZVtyb2xlPVwidGFicGFuZWxcIl0nLCB7aWQ6IGRhdGEuaWR9LCBtLmNvbXBvbmVudChkYXRhLmNvbXBvbmVudCkpXG4gICAgICAgICAgICAgICAgICAgIDogXCJcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgIF0pXG59Iiwi77u/J3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG5pbXBvcnQge2Rhc2hib2FyZH0gZnJvbSBcIi4vZGFzaGJvYXJkXCJcbmltcG9ydCB7Q2F0ZWdvcnlHcmlkfSBmcm9tIFwiLi9wcm9kdWN0L2NhdGVnb3J5Z3JpZFwiXG5pbXBvcnQge1Byb2R1Y3RMaXN0fSBmcm9tIFwiLi9wcm9kdWN0L3Byb2R1Y3RsaXN0XCJcbmltcG9ydCB7UHJvZHVjdFBhZ2V9IGZyb20gXCIuL3Byb2R1Y3QvcHJvZHVjdFwiXG5pbXBvcnQge0FjY291bnR9IGZyb20gXCIuL2FjY291bnQvYWNjb3VudFwiXG5pbXBvcnQge3dpdGhMYXlvdXR9IGZyb20gXCIuL2xheW91dC9sYXlvdXRcIlxuXG4vL3NldHVwIHJvdXRlcyB0byBzdGFydCB3LyB0aGUgYCNgIHN5bWJvbFxubS5yb3V0ZS5tb2RlID0gXCJoYXNoXCI7XG5cbm0ucm91dGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZG1pbi1hcHBcIiksIFwiL1wiLCB7XG4gICAgXCIvXCI6IHdpdGhMYXlvdXQoZGFzaGJvYXJkKSxcbiAgICBcIi9hY2NvdW50XCI6IHdpdGhMYXlvdXQoQWNjb3VudCksXG4gICAgXCIvY2F0ZWdvcmllc1wiOiB3aXRoTGF5b3V0KENhdGVnb3J5R3JpZCksXG4gICAgXCIvcHJvZHVjdHNcIjogd2l0aExheW91dChQcm9kdWN0TGlzdCksXG4gICAgXCIvcHJvZHVjdHMvOmlkXCI6IHdpdGhMYXlvdXQoUHJvZHVjdFBhZ2UpLFxufSk7Iiwi77u/J3VzZSBzdHJpY3QnO1xuLypnbG9iYWwgbSAqL1xuXG5pbXBvcnQge21yZXF1ZXN0LCBwYXJzZUVycm9yLCBkaXNwbGF5Zm9yLCBtZXRhZGF0YSwgaW5wdXRmb3IsIHBhZ2VzLCBzb3J0cywgZ2V0Q29va2llLCBzZXRDb29raWV9IGZyb20gXCIuLi9oZWxwZXJzL2Z1bmN0aW9uc1wiXG5pbXBvcnQge01vZGVsfSBmcm9tIFwiLi4vaGVscGVycy9tb2RlbFwiXG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gXCIuLi9sYXlvdXQvc3Bpbm5lclwiXG5pbXBvcnQge1BhZ2VTaXplU2VsZWN0b3J9IGZyb20gXCIuLi9sYXlvdXQvcGFnZXNpemVzZWxlY3RvclwiXG5pbXBvcnQge1BhZ2luYXRvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdpbmF0b3JcIlxuXG5leHBvcnQgdmFyIENhdGVnb3J5ID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgZGF0YSA9IGRhdGEgfHwge31cbiAgICB0aGlzLmlkID0gbS5wcm9wKGRhdGEuaWQgfHwgMClcbiAgICB0aGlzLm5hbWUgPSBtLnByb3AoZGF0YS5uYW1lIHx8ICcnKVxuICAgIHRoaXMuaXNwdWJsaXNoZWQgPSBtLnByb3AoZGF0YS5pc1B1Ymxpc2hlZCB8fCBmYWxzZSlcbiAgICB0aGlzLl9fUmVxdWVzdFZlcmlmaWNhdGlvblRva2VuID0gbS5wcm9wKGdldHRva2VuKCkpXG59XG5cbmV4cG9ydCB2YXIgQ2F0ZWdvcnlHcmlkID0ge31cbkNhdGVnb3J5R3JpZC52bSA9IHt9XG5DYXRlZ29yeUdyaWQudm0uaW5pdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBhcmdzID0gYXJncyB8fCB7fVxuICAgIHZhciB2bSA9IHRoaXNcbiAgICB2bS5tb2RlbCA9IG5ldyBNb2RlbCh7dXJsOiBcIi9hcGkvY2F0ZWdvcmllc1wiLCB0eXBlOiBDYXRlZ29yeX0pXG4gICAgdm0ubGlzdCA9IHZtLm1vZGVsLmluZGV4KClcbiAgICByZXR1cm4gdGhpc1xufVxuQ2F0ZWdvcnlHcmlkLmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzXG5cbiAgICBjdHJsLnZtID0gQ2F0ZWdvcnlHcmlkLnZtLmluaXQoKVxuICAgIGN0cmwudXBkYXRpbmcgPSBtLnByb3AodHJ1ZSkgLy93YWl0aW5nIGZvciBkYXRhIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kXG4gICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSkgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSBcItCa0LDRgtC10LPQvtGA0LjQuCDRgtC+0LLQsNGA0L7QslwiXG4gICAgY3RybC5lZGl0aW5naWQgPSBtLnByb3AoJycpIC8vaWQgb2YgdGhlIHJvdywgdGhhdCBpcyBiZWluZyBlZGl0ZWRcbiAgICBjdHJsLnJlY29yZCA9IG0ucHJvcCgnJykgLy90ZW1wb3Jhcnkgc3RhdGUgb2YgdGhlIHJvdywgdGhhdCBpcyBiZWluZyBlZGl0ZWRcbiAgICBjdHJsLnBhZ2VzaXplID0gbS5wcm9wKGdldENvb2tpZShcInBhZ2VzaXplXCIpIHx8IDEwKSAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICAgIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCkgLy9jdXJyZW50IHBhZ2UsIHN0YXJ0aW5nIHdpdGggMFxuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpXG5cbiAgICBjdHJsLnN0YXJ0ZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBjdHJsLmVkaXRpbmdpZChyb3cuaWQoKSlcbiAgICAgICAgY3RybC5yZWNvcmQgPSBuZXcgQ2F0ZWdvcnkoe2lkOiByb3cuaWQoKSwgaXNQdWJsaXNoZWQ6IHJvdy5pc3B1Ymxpc2hlZCgpLCBuYW1lOiByb3cubmFtZSgpfSlcbiAgICB9XG4gICAgY3RybC51cGRhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgY3RybC51cGRhdGluZyh0cnVlKVxuICAgICAgICBtLnJlZHJhdygpXG4gICAgICAgIGN0cmwudm0ubW9kZWwudXBkYXRlKGN0cmwucmVjb3JkKVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5lZGl0aW5naWQoJycpXG4gICAgICAgICAgICAgICAgY3RybC52bS5saXN0KClbY3RybC52bS5saXN0KCkuaW5kZXhPZihyb3cpXSA9IGN0cmwucmVjb3JkIC8vdXBkYXRlIGN1cnJlbnQgcm93IGluIGdyaWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoZXJyb3IpID0+IGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXG4gICAgICAgICkudGhlbigoKSA9PiB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KVxuICAgIH1cbiAgICBjdHJsLnN0YXJ0Y3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwuZWRpdGluZ2lkKCduZXcnKVxuICAgICAgICBjdHJsLnJlY29yZCA9IG5ldyBDYXRlZ29yeSh7aWQ6IDAsIGlzUHVibGlzaGVkOiB0cnVlLCBuYW1lOiAnJ30pXG4gICAgfVxuICAgIGN0cmwuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcbiAgICAgICAgbS5yZWRyYXcoKVxuICAgICAgICBjdHJsLnZtLm1vZGVsLmNyZWF0ZShjdHJsLnJlY29yZCkudGhlbihcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpXG4gICAgICAgICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5lZGl0aW5naWQoJycpO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnVwZGF0aW5nKGZhbHNlKTsgXG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXG4gICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7IFxuICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH1cbiAgICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBjdHJsLnVwZGF0aW5nKHRydWUpXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpIC8vcHJldmVudCB0ci5vbmNsaWNrIHRyaWdnZXJcbiAgICAgICAgY3RybC52bS5tb2RlbC5kZWxldGUocm93LmlkKCkpLnRoZW4oXG4gICAgICAgICAgICAoc3VjY2VzcykgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdCA9IGN0cmwudm0ubW9kZWwuaW5kZXgoKVxuICAgICAgICAgICAgICAgIGN0cmwudm0ubGlzdC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmN1cnJlbnRwYWdlKCkrMSA+IHBhZ2VzKGN0cmwudm0ubGlzdCgpLmxlbmd0aCwgY3RybC5wYWdlc2l6ZSgpKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY3VycmVudHBhZ2UoTWF0aC5tYXgoY3RybC5jdXJyZW50cGFnZSgpLTEsIDApKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwudXBkYXRpbmcoZmFsc2UpXG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKVxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfVxuICAgIGN0cmwuY2FuY2VsZWRpdCA9IGZ1bmN0aW9uKCl7IGN0cmwuZWRpdGluZ2lkKCcnKSB9XG59XG5DYXRlZ29yeUdyaWQudmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG5cbiAgICB2YXIgZWRpdFJvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbSgndHInLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiggIWluaXQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5vbmtleXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIGN0cmwudXBkYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAyNykgeyBjdHJsLmNhbmNlbGVkaXQoKTsgbS5yZWRyYXcoKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsnLCBjdHJsLnJlY29yZC5pZCgpKSxcbiAgICAgICAgICAgICAgICBtKCd0ZCcsIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoICFpbml0ICkgZWwuZm9jdXMoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5yZWNvcmQubmFtZSgpLCBcbiAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnJlY29yZC5uYW1lKVxuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsnLFxuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFt0eXBlPWNoZWNrYm94XScsIHsgY2hlY2tlZDogY3RybC5yZWNvcmQuaXNwdWJsaXNoZWQoKSwgb25jbGljazogbS53aXRoQXR0cihcImNoZWNrZWRcIiwgY3RybC5yZWNvcmQuaXNwdWJsaXNoZWQpfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QodC+0YXRgNCw0L3QuNGC0YxdJywge29uY2xpY2s6IGN0cmwudXBkYXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLWNoZWNrJykpLFxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QntGC0LzQtdC90LBdJywge29uY2xpY2s6IGN0cmwuY2FuY2VsZWRpdH0sIG0oJ2kuZmEuZmEtdGltZXMnKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksIC8vdHJcbiAgICAgICAgICAgIGN0cmwuZXJyb3IoKVxuICAgICAgICAgICAgPyBtKCd0ci5lcnJvci5hbmltYXRlZC5mYWRlSW4nLCBbXG4gICAgICAgICAgICAgICAgbSgndGQnKSxcbiAgICAgICAgICAgICAgICBtKCd0ZC50ZXh0LWRhbmdlcltjb2xzcGFuPTJdJywgY3RybC5lcnJvcigpKSxcbiAgICAgICAgICAgICAgICBtKCd0ZCcpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgIF1cbiAgICB9IC8vZWRpdFJvd1RlbXBsYXRlXG5cbiAgICB2YXIgc2hvd1Jvd1RlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gbSgndHIuY2xpY2thYmxlJywge29uY2xpY2s6IGN0cmwuc3RhcnRlZGl0LmJpbmQodGhpcywgZGF0YSl9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycsIGRhdGEuaWQoKSksXG4gICAgICAgICAgICAgICAgbSgndGQnLCBkYXRhLm5hbWUoKSksXG4gICAgICAgICAgICAgICAgbSgndGQuc2hyaW5rLnRleHQtY2VudGVyJywgZGF0YS5pc3B1Ymxpc2hlZCgpID8gbSgnaS5mYS5mYS1jaGVjaycpIDogbSgnaS5mYS5mYS10aW1lcycpKSxcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsW1xuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjF0nLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sIG0oJ2kuZmEuZmEtcGVuY2lsJykpLFxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGFuZ2VyW3RpdGxlPdCj0LTQsNC70LjRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmRlbGV0ZS5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1yZW1vdmUnKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXVxuICAgICAgICApXG4gICAgfSAvL3Nob3dSb3dUZW1wbGF0ZVxuXG4gICAgdmFyIGNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbSgndHInLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaW5pdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiggIWluaXQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5vbmtleXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIGN0cmwuY3JlYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDI3KSB7IGN0cmwuY2FuY2VsZWRpdCgpOyBtLnJlZHJhdygpOyByZXR1cm4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluaycpLFxuICAgICAgICAgICAgICAgICAgICBtKCd0ZCcsIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGluaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggIWluaXQgKSBlbC5mb2N1cygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN0cmwucmVjb3JkLm5hbWUoKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cihcInZhbHVlXCIsIGN0cmwucmVjb3JkLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgbSgndGQuc2hyaW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywgeyBjaGVja2VkOiBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCgpLCBvbmNsaWNrOiBtLndpdGhBdHRyKFwiY2hlY2tlZFwiLCBjdHJsLnJlY29yZC5pc3B1Ymxpc2hlZCl9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsuYWN0aW9ucycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCh0L7Qt9C00LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLmNyZWF0ZX0sIG0oJ2kuZmEuZmEtY2hlY2snKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tZGVmYXVsdFt0aXRsZT3QntGC0LzQtdC90LBdJywge29uY2xpY2s6IGN0cmwuY2FuY2VsZWRpdH0sIG0oJ2kuZmEuZmEtdGltZXMnKSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApLCAvL3RyXG4gICAgICAgICAgICBjdHJsLmVycm9yKClcbiAgICAgICAgICAgID8gbSgndHIuZXJyb3IuYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICAgICAgICAgIG0oJ3RkJyksXG4gICAgICAgICAgICAgICAgbSgndGQudGV4dC1kYW5nZXJbY29sc3Bhbj0yXScsIGN0cmwuZXJyb3IoKSksXG4gICAgICAgICAgICAgICAgbSgndGQnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIDogXCJcIlxuICAgICAgICBdXG4gICAgfSAvL2NyZWF0ZVRlbXBsYXRlXG5cbiAgICAvL2NvbXBsZXRlIHZpZXdcbiAgICByZXR1cm4gbShcIiNjYXRlZ29yeWxpc3RcIiwgW1xuICAgICAgICBtKFwiaDFcIiwgY3RybC50aXRsZSksXG4gICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgIG0oJ3RhYmxlLnRhYmxlLnRhYmxlLXN0cmlwZWQuYW5pbWF0ZWQuZmFkZUluJywgc29ydHMoY3RybC52bS5saXN0KCkpLCBbXG4gICAgICAgICAgICAgICAgbSgndGhlYWQnLCBcbiAgICAgICAgICAgICAgICAgICAgbSgndHInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd0aC5zaHJpbmsuY2xpY2thYmxlW2RhdGEtc29ydC1ieT1pZF0nLCAn4oSWJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PW5hbWVdJywgJ9Cd0LDQt9Cy0LDQvdC40LUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlzcHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5hY3Rpb25zJywgJyMnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NsaWNlIGZpbHRlcnMgcmVjb3JkcyBmcm9tIGN1cnJlbnQgcGFnZSBvbmx5XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGN0cmwuZWRpdGluZ2lkKCkgPT0gZGF0YS5pZCgpKSA/IGVkaXRSb3dUZW1wbGF0ZShkYXRhKSA6IHNob3dSb3dUZW1wbGF0ZShkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWN0cmwudm0ubGlzdCgpLmxlbmd0aCkgXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG0oJ3RyJywgbSgndGQudGV4dC1jZW50ZXIudGV4dC1tdXRlZFtjb2xzcGFuPTRdJywgJ9Ch0L/QuNGB0L7QuiDQv9GD0YHRgiwg0L3QsNC20LzQuNGC0LUg0JTQvtCx0LDQstC40YLRjCwg0YfRgtC+0LHRiyDRgdC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINC30LDQv9C40YHRjC4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLmVkaXRpbmdpZCgpID09IFwibmV3XCIpID8gY3JlYXRlVGVtcGxhdGUoKSA6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnVwZGF0aW5nKCkgPyBtLmNvbXBvbmVudChTcGlubmVyKSA6IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIDogbS5jb21wb25lbnQoU3Bpbm5lcilcbiAgICAgICAgICAgICAgICApLCAvL3Rib2R5XG4gICAgICAgICAgICBdKSwgLy90YWJsZVxuICAgICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeScsIHsgb25jbGljazogY3RybC5zdGFydGNyZWF0ZSB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcGx1cycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQsNGC0LXQs9C+0YDQuNGOJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcucHVsbC1yaWdodCcsIG0uY29tcG9uZW50KFBhZ2VTaXplU2VsZWN0b3IsIGN0cmwucGFnZXNpemUpKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBjdHJsLnZtLmxpc3QoKSA/IG0uY29tcG9uZW50KFBhZ2luYXRvciwge2xpc3Q6IGN0cmwudm0ubGlzdCwgcGFnZXNpemU6IGN0cmwucGFnZXNpemUsIGN1cnJlbnRwYWdlOiBjdHJsLmN1cnJlbnRwYWdlLCBvbnNldHBhZ2U6IGN0cmwuY3VycmVudHBhZ2V9KSA6IFwiXCIsXG4gICAgICAgIF0pXG4gICAgXSlcbn0iLCLvu78ndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbmltcG9ydCB7bXJlcXVlc3QsIHBhcnNlRXJyb3IsIGRpc3BsYXlmb3IsIG1ldGFkYXRhLCBpbnB1dGZvciwgcGFnZXMsIHNvcnRzLCBnZXRDb29raWUsIHNldENvb2tpZX0gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcbmltcG9ydCB7TW9kZWx9IGZyb20gXCIuLi9oZWxwZXJzL21vZGVsXCJcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSBcIi4uL2xheW91dC9zcGlubmVyXCJcbmltcG9ydCB7UGFnZVNpemVTZWxlY3Rvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCJcbmltcG9ydCB7UGFnaW5hdG9yfSBmcm9tIFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiXG5pbXBvcnQge0NhdGVnb3J5fSBmcm9tIFwiLi9jYXRlZ29yeWdyaWRcIlxuXG5leHBvcnQgdmFyIENhdGVnb3J5U2VsZWN0ID0ge31cbkNhdGVnb3J5U2VsZWN0LnZtID0ge31cbkNhdGVnb3J5U2VsZWN0LnZtLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MgfHwge31cbiAgICB2YXIgdm0gPSB0aGlzXG4gICAgdm0ubGlzdCA9IG1yZXF1ZXN0KHsgbWV0aG9kOiBcIkdFVFwiLCB1cmw6IFwiL2FwaS9jYXRlZ29yaWVzXCIsIHR5cGU6IENhdGVnb3J5IH0pXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuLy9hcmdzOiB7dmFsdWU6IG0ucHJvcCwgZXJyb3I6IG0ucHJvcCBvcHRpb25hbH1cbkNhdGVnb3J5U2VsZWN0LmNvbnRyb2xsZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MgfHwge31cbiAgICB2YXIgY3RybCA9IHRoaXNcbiAgICBjdHJsLnZhbHVlID0gYXJncy52YWx1ZVxuICAgIGN0cmwudm0gPSBDYXRlZ29yeVNlbGVjdC52bS5pbml0KClcbiAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbihkYXRhKXsgaWYgKGRhdGEubGVuZ3RoKSBjdHJsLnZhbHVlKGRhdGFbMF0uaWQoKSkgfSkgLy9pbml0aWFsIHZhbHVlXG4gICAgY3RybC5lcnJvciA9IGFyZ3MuZXJyb3IgfHwgbS5wcm9wKCcnKVxufVxuQ2F0ZWdvcnlTZWxlY3QudmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICByZXR1cm4gbShcInNlbGVjdC5mb3JtLWNvbnRyb2xcIiwge1xuICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBjdHJsLnZhbHVlKVxuICAgICAgICB9LFxuICAgICAgICBjdHJsLnZtLmxpc3QoKSBcbiAgICAgICAgPyBjdHJsLnZtLmxpc3QoKS5tYXAoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uJywge3ZhbHVlOiBkYXRhLmlkKCl9LCBkYXRhLm5hbWUoKSlcbiAgICAgICAgfSlcbiAgICAgICAgOiBcIlwiXG4gICAgKVxufSIsIu+7vyd1c2Ugc3RyaWN0Jztcbi8qZ2xvYmFsIG0gKi9cblxuaW1wb3J0IHttcmVxdWVzdCwgcGFyc2VFcnJvciwgZGlzcGxheWZvciwgbWV0YWRhdGEsIGxhYmVsZm9yLCBpbnB1dGZvciwgcGFnZXMsIHNvcnRzLCBnZXRDb29raWUsIHNldENvb2tpZX0gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcbmltcG9ydCB7TW9kZWx9IGZyb20gXCIuLi9oZWxwZXJzL21vZGVsXCJcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSBcIi4uL2xheW91dC9zcGlubmVyXCJcbmltcG9ydCB7UGFnZVNpemVTZWxlY3Rvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCJcbmltcG9ydCB7UGFnaW5hdG9yfSBmcm9tIFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiXG5pbXBvcnQge0NhdGVnb3J5fSBmcm9tIFwiLi9jYXRlZ29yeWdyaWRcIlxuaW1wb3J0IHtDYXRlZ29yeVNlbGVjdH0gZnJvbSBcIi4vY2F0ZWdvcnlzZWxlY3RcIlxuXG5leHBvcnQgdmFyIFByb2R1Y3QgPSBmdW5jdGlvbihkYXRhKXtcbiAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgIHRoaXMuaWQgPSBtLnByb3AoZGF0YS5pZCB8fCAwKVxuICAgIHRoaXMubmFtZSA9IG0ucHJvcChkYXRhLm5hbWUgfHwgJycpXG4gICAgdGhpcy5pc3B1Ymxpc2hlZCA9IG0ucHJvcChkYXRhLmlzUHVibGlzaGVkIHx8IGZhbHNlKVxuICAgIHRoaXMuY2F0ZWdvcnluYW1lID0gbS5wcm9wKGRhdGEuY2F0ZWdvcnlOYW1lIHx8ICcnKVxuICAgIHRoaXMuY2F0ZWdvcnlpZCA9IG0ucHJvcChkYXRhLmNhdGVnb3J5SWQgfHwgMClcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEuZGVzY3JpcHRpb24gfHwgJycpXG4gICAgdGhpcy5pbWFnZSA9IG0ucHJvcChkYXRhLmltYWdlIHx8ICcnKVxuICAgIHRoaXMucHJpY2UgPSBtLnByb3AoZGF0YS5wcmljZSB8fCBudWxsKVxuICAgIHRoaXMubWV0YSA9IG0ucHJvcChtZXRhZGF0YShkYXRhLm1ldGEpKVxuICAgIHRoaXMuX19SZXF1ZXN0VmVyaWZpY2F0aW9uVG9rZW4gPSBtLnByb3AoZ2V0dG9rZW4oKSlcbn1cblxuZXhwb3J0IHZhciBQcm9kdWN0UGFnZSA9IHt9XG5Qcm9kdWN0UGFnZS52bSA9IHt9XG5Qcm9kdWN0UGFnZS52bS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZtID0gdGhpc1xuICAgIHZtLm1vZGVsID0gbmV3IE1vZGVsKHt1cmw6IFwiL2FwaS9wcm9kdWN0c1wiLCB0eXBlOiBQcm9kdWN0fSlcbiAgICB2bS5yZWNvcmQgPSAgdm0ubW9kZWwuZ2V0KG0ucm91dGUucGFyYW0oXCJpZFwiKSlcbiAgICByZXR1cm4gdGhpc1xufVxuUHJvZHVjdFBhZ2UuY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3RybCA9IHRoaXNcblxuICAgIGN0cmwudm0gPSBQcm9kdWN0UGFnZS52bS5pbml0KClcbiAgICBjdHJsLnVwZGF0aW5nID0gbS5wcm9wKHRydWUpIC8vd2FpdGluZyBmb3IgZGF0YSB1cGRhdGUgaW4gYmFja2dyb3VuZFxuICAgIGN0cmwudm0ucmVjb3JkLnRoZW4oZnVuY3Rpb24oKSB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCk7fSkgLy9oaWRlIHNwaW5uZXIgYW5kIHJlZHJhdyBhZnRlciBkYXRhIGFycml2ZSBcbiAgICBjdHJsLnRpdGxlID0gZG9jdW1lbnQudGl0bGUgPSAobS5yb3V0ZS5wYXJhbShcImlkXCIpID09IFwibmV3XCIpID8gXCLQodC+0LfQtNCw0L3QuNC1INC90L7QstC+0LPQviDRgtC+0LLQsNGA0LBcIiA6IFwi0JrQsNGA0YLQvtGH0LrQsCDRgtC+0LLQsNGA0LBcIlxuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpXG4gICAgY3RybC5tZXNzYWdlID0gbS5wcm9wKCcnKSAvL25vdGlmaWNhdGlvbnNcblxuICAgIGN0cmwudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcbiAgICAgICAgbS5yZWRyYXcoKVxuICAgICAgICBjdHJsLnZtLm1vZGVsLnVwZGF0ZShjdHJsLnZtLnJlY29yZClcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoc3VjY2VzcykgPT4gY3RybC5tZXNzYWdlKCfQmNC30LzQtdC90LXQvdC40Y8g0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyksXG4gICAgICAgICAgICAoZXJyb3IpID0+IGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXG4gICAgICAgICkudGhlbigoKSA9PiB7Y3RybC51cGRhdGluZyhmYWxzZSk7IG0ucmVkcmF3KCl9KVxuICAgIH1cbiAgICBjdHJsLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdHJsLnVwZGF0aW5nKHRydWUpXG4gICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgY3RybC52bS5tb2RlbC5jcmVhdGUoY3RybC52bS5yZWNvcmQpLnRoZW4oXG4gICAgICAgICAgICAoc3VjY2VzcykgPT4gbS5yb3V0ZShcIi9wcm9kdWN0c1wiKSxcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXG4gICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSk7IFxuICAgICAgICAgICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH1cbiAgICBjdHJsLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdHJsLnVwZGF0aW5nKHRydWUpXG4gICAgICAgIGN0cmwudm0ubW9kZWwuZGVsZXRlKGN0cmwudm0ucmVjb3JkLmlkKCkpLnRoZW4oXG4gICAgICAgICAgICAoc3VjY2VzcykgPT4gbS5yb3V0ZShcIi9wcm9kdWN0c1wiKSxcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZXJyb3IocGFyc2VFcnJvcihlcnJvcikpXG4gICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSlcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9XG59XG5Qcm9kdWN0UGFnZS52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICAgIC8vY29tcGxldGUgdmlld1xuICAgIHJldHVybiBtKFwiI2NhdGVnb3J5bGlzdFwiLCBbXG4gICAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgICAgY3RybC52bS5yZWNvcmQoKVxuICAgICAgICA/IG0oJ2Zvcm0uYW5pbWF0ZWQuZmFkZUluJywgW1xuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICAgICAgbGFiZWxmb3IoJ25hbWUnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgaW5wdXRmb3IoJ25hbWUnLCBjdHJsLnZtLnJlY29yZClcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2ltYWdlJywgY3RybC52bS5yZWNvcmQpLFxuICAgICAgICAgICAgICAgIGlucHV0Zm9yKCdpbWFnZScsIGN0cmwudm0ucmVjb3JkKSAvL2ZpbGVmb3JcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICAgICAgbGFiZWxmb3IoJ2NhdGVnb3J5aWQnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoQ2F0ZWdvcnlTZWxlY3QsIHt2YWx1ZTogY3RybC52bS5yZWNvcmQoKS5jYXRlZ29yeWlkLCBlcnJvcjogY3RybC5lcnJvcn0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdpc3B1Ymxpc2hlZCcsIGN0cmwudm0ucmVjb3JkKSxcbiAgICAgICAgICAgICAgICBpbnB1dGZvcignaXNwdWJsaXNoZWQnLCBjdHJsLnZtLnJlY29yZCkgLy9jaGVja2JveGZvclxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgICAgICBsYWJlbGZvcigncHJpY2UnLCBjdHJsLnZtLnJlY29yZCksXG4gICAgICAgICAgICAgICAgaW5wdXRmb3IoJ3ByaWNlJywgY3RybC52bS5yZWNvcmQpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgICAgIGxhYmVsZm9yKCdkZXNjcmlwdGlvbicsIGN0cmwudm0ucmVjb3JkKSxcbiAgICAgICAgICAgICAgICBpbnB1dGZvcignZGVzY3JpcHRpb24nLCBjdHJsLnZtLnJlY29yZCkgLy90ZXh0YXJlYWZvclxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAoY3RybC5tZXNzYWdlKCkpID8gbSgnLmFjdGlvbi1tZXNzYWdlLmFuaW1hdGVkLmZhZGVJblJpZ2h0JywgY3RybC5tZXNzYWdlKCkpIDogXCJcIixcbiAgICAgICAgICAgIChjdHJsLmVycm9yKCkpID8gbSgnLmFjdGlvbi1hbGVydC5hbmltYXRlZC5mYWRlSW5SaWdodCcsIGN0cmwuZXJyb3IoKSkgOiBcIlwiLFxuICAgICAgICAgICAgbSgnLmFjdGlvbnMnLCBbXG4gICAgICAgICAgICAgICAgKG0ucm91dGUucGFyYW0oXCJpZFwiKSA9PSBcIm5ld1wiKVxuICAgICAgICAgICAgICAgID8gbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLmNyZWF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLnVwZGF0aW5nKCkpID8gbSgnaS5mYS5mYS1zcGluLmZhLXJlZnJlc2gnKSA6IG0oJ2kuZmEuZmEtY2hlY2snKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICfQodC+0LfQtNCw0YLRjCcpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tcHJpbWFyeVt0eXBlPVwic3VibWl0XCJdJywgeyBvbmNsaWNrOiBjdHJsLnVwZGF0ZSwgZGlzYWJsZWQ6IGN0cmwudXBkYXRpbmcoKSB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC51cGRhdGluZygpKSA/IG0oJ2kuZmEuZmEtc3Bpbi5mYS1yZWZyZXNoJykgOiBtKCdpLmZhLmZhLWNoZWNrJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Ch0L7RhdGA0LDQvdC40YLRjCcpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1kYW5nZXInLCB7IG9uY2xpY2s6IGN0cmwuZGVsZXRlLCBkaXNhYmxlZDogY3RybC51cGRhdGluZygpIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2kuZmEuZmEtcmVtb3ZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ9Cj0LTQsNC70LjRgtGMJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgICAgOiBtLmNvbXBvbmVudChTcGlubmVyLCB7c3RhbmRhbG9uZTogdHJ1ZX0pXG4gICAgXSlcbn0iLCLvu78ndXNlIHN0cmljdCc7XG4vKmdsb2JhbCBtICovXG5cbmltcG9ydCB7bXJlcXVlc3QsIHBhcnNlRXJyb3IsIGRpc3BsYXlmb3IsIG1ldGFkYXRhLCBpbnB1dGZvciwgcGFnZXMsIHNvcnRzLCBnZXRDb29raWUsIHNldENvb2tpZX0gZnJvbSBcIi4uL2hlbHBlcnMvZnVuY3Rpb25zXCJcbmltcG9ydCB7TW9kZWx9IGZyb20gXCIuLi9oZWxwZXJzL21vZGVsXCJcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSBcIi4uL2xheW91dC9zcGlubmVyXCJcbmltcG9ydCB7UGFnZVNpemVTZWxlY3Rvcn0gZnJvbSBcIi4uL2xheW91dC9wYWdlc2l6ZXNlbGVjdG9yXCJcbmltcG9ydCB7UGFnaW5hdG9yfSBmcm9tIFwiLi4vbGF5b3V0L3BhZ2luYXRvclwiXG5pbXBvcnQge1Byb2R1Y3R9IGZyb20gXCIuL3Byb2R1Y3RcIlxuXG5leHBvcnQgdmFyIFByb2R1Y3RMaXN0ID0ge31cblByb2R1Y3RMaXN0LnZtID0ge31cblByb2R1Y3RMaXN0LnZtLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MgfHwge31cbiAgICB2YXIgdm0gPSB0aGlzXG4gICAgdm0ubW9kZWwgPSBuZXcgTW9kZWwoe3VybDogXCIvYXBpL3Byb2R1Y3RzXCIsIHR5cGU6IFByb2R1Y3R9KVxuICAgIHZtLmxpc3QgPSB2bS5tb2RlbC5pbmRleCgpXG4gICAgcmV0dXJuIHRoaXNcbn1cblByb2R1Y3RMaXN0LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzXG5cbiAgICBjdHJsLnZtID0gUHJvZHVjdExpc3Qudm0uaW5pdCgpXG4gICAgY3RybC51cGRhdGluZyA9IG0ucHJvcCh0cnVlKSAvL3dhaXRpbmcgZm9yIGRhdGEgdXBkYXRlIGluIGJhY2tncm91bmRcbiAgICBjdHJsLnZtLmxpc3QudGhlbihmdW5jdGlvbigpIHtjdHJsLnVwZGF0aW5nKGZhbHNlKTsgbS5yZWRyYXcoKTt9KSAvL2hpZGUgc3Bpbm5lciBhbmQgcmVkcmF3IGFmdGVyIGRhdGEgYXJyaXZlIFxuICAgIGN0cmwudGl0bGUgPSBkb2N1bWVudC50aXRsZSA9IFwi0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyXCJcbiAgICBjdHJsLnBhZ2VzaXplID0gbS5wcm9wKGdldENvb2tpZShcInBhZ2VzaXplXCIpIHx8IDEwKSAvL251bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICAgIGN0cmwuY3VycmVudHBhZ2UgPSBtLnByb3AoMCkgLy9jdXJyZW50IHBhZ2UsIHN0YXJ0aW5nIHdpdGggMFxuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpXG5cbiAgICBjdHJsLnN0YXJ0ZWRpdCA9IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBjb25zb2xlLmxvZygnVXNlIG0ucm91dGUgdG8gcmVkaXJlY3QnKVxuICAgIH1cbiAgICBjdHJsLnN0YXJ0Y3JlYXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIG0ucm91dGUoXCIvcHJvZHVjdHMvbmV3XCIpXG4gICAgfVxuICAgIGN0cmwuZGVsZXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIGN0cmwudXBkYXRpbmcodHJ1ZSlcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkgLy9wcmV2ZW50IHRyLm9uY2xpY2sgdHJpZ2dlclxuICAgICAgICBjdHJsLnZtLm1vZGVsLmRlbGV0ZShyb3cuaWQoKSkudGhlbihcbiAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC52bS5saXN0ID0gY3RybC52bS5tb2RlbC5pbmRleCgpXG4gICAgICAgICAgICAgICAgY3RybC52bS5saXN0LnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuY3VycmVudHBhZ2UoKSsxID4gcGFnZXMoY3RybC52bS5saXN0KCkubGVuZ3RoLCBjdHJsLnBhZ2VzaXplKCkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5jdXJyZW50cGFnZShNYXRoLm1heChjdHJsLmN1cnJlbnRwYWdlKCktMSwgMCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC51cGRhdGluZyhmYWxzZSlcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9XG59XG5Qcm9kdWN0TGlzdC52aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcblxuICAgIHZhciBzaG93Um93VGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBtKCd0ci5jbGlja2FibGUnLCB7b25jbGljazogY3RybC5zdGFydGVkaXQuYmluZCh0aGlzLCBkYXRhKX0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbSgndGQuc2hyaW5rJywgZGF0YS5pZCgpKSxcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsnLCAoZGF0YS5pbWFnZSgpKSA/IG0oJ2ltZy5pbWFnZS1wcmV2aWV3LmltZy1yZXNwb25zaXZlJywge3NyYzogZGF0YS5pbWFnZSgpfSkgOiBcIlwiKSxcbiAgICAgICAgICAgICAgICBtKCd0ZCcsIGRhdGEubmFtZSgpKSxcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsnLCBkYXRhLmNhdGVnb3J5bmFtZSgpKSxcbiAgICAgICAgICAgICAgICBtKCd0ZC5zaHJpbmsudGV4dC1jZW50ZXInLCBkYXRhLmlzcHVibGlzaGVkKCkgPyBtKCdpLmZhLmZhLWNoZWNrJykgOiBtKCdpLmZhLmZhLXRpbWVzJykpLFxuICAgICAgICAgICAgICAgIG0oJ3RkLnNocmluay5hY3Rpb25zJyxbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kZWZhdWx0W3RpdGxlPdCg0LXQtNCw0LrRgtC40YDQvtCy0LDRgtGMXScsIHtvbmNsaWNrOiBjdHJsLnN0YXJ0ZWRpdC5iaW5kKHRoaXMsIGRhdGEpfSwgbSgnaS5mYS5mYS1wZW5jaWwnKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1kYW5nZXJbdGl0bGU90KPQtNCw0LvQuNGC0YxdJywge29uY2xpY2s6IGN0cmwuZGVsZXRlLmJpbmQodGhpcywgZGF0YSl9LCBtKCdpLmZhLmZhLXJlbW92ZScpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICB9IC8vc2hvd1Jvd1RlbXBsYXRlXG5cbiAgICAvL2NvbXBsZXRlIHZpZXdcbiAgICByZXR1cm4gbShcIiNwcm9kdWN0bGlzdFwiLCBbXG4gICAgICAgIG0oXCJoMVwiLCBjdHJsLnRpdGxlKSxcbiAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgbSgndGFibGUudGFibGUudGFibGUtc3RyaXBlZC5hbmltYXRlZC5mYWRlSW4nLCBzb3J0cyhjdHJsLnZtLmxpc3QoKSksIFtcbiAgICAgICAgICAgICAgICBtKCd0aGVhZCcsIFxuICAgICAgICAgICAgICAgICAgICBtKCd0cicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlkXScsICfihJYnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9aW1hZ2VdJywgJ9Ck0L7RgtC+JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd0aC5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PW5hbWVdJywgJ9Cd0LDQt9Cy0LDQvdC40LUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLmNsaWNrYWJsZVtkYXRhLXNvcnQtYnk9Y2F0ZWdvcnluYW1lXScsICfQmtCw0YLQtdCz0L7RgNC40Y8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5jbGlja2FibGVbZGF0YS1zb3J0LWJ5PWlzcHVibGlzaGVkXScsICfQntC/0YPQsdC70LjQutC+0LLQsNC90LAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RoLnNocmluay5hY3Rpb25zJywgJyMnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbSgndGJvZHknLCBcbiAgICAgICAgICAgICAgICAgICAgY3RybC52bS5saXN0KClcbiAgICAgICAgICAgICAgICAgICAgLy9pZiByZWNvcmQgbGlzdCBpcyByZWFkeSwgZWxzZSBzaG93IHNwaW5uZXJcbiAgICAgICAgICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NsaWNlIGZpbHRlcnMgcmVjb3JkcyBmcm9tIGN1cnJlbnQgcGFnZSBvbmx5XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnZtLmxpc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShjdHJsLmN1cnJlbnRwYWdlKCkqY3RybC5wYWdlc2l6ZSgpLCAoY3RybC5jdXJyZW50cGFnZSgpKzEpKmN0cmwucGFnZXNpemUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2hvd1Jvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICghY3RybC52bS5saXN0KCkubGVuZ3RoKSBcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbSgndHInLCBtKCd0ZC50ZXh0LWNlbnRlci50ZXh0LW11dGVkW2NvbHNwYW49NF0nLCAn0KHQv9C40YHQvtC6INC/0YPRgdGCLCDQvdCw0LbQvNC40YLQtSDQlNC+0LHQsNCy0LjRgtGMLCDRh9GC0L7QsdGLINGB0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LfQsNC/0LjRgdGMLicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC51cGRhdGluZygpID8gbS5jb21wb25lbnQoU3Bpbm5lcikgOiBcIlwiXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICA6IG0uY29tcG9uZW50KFNwaW5uZXIpXG4gICAgICAgICAgICAgICAgKSwgLy90Ym9keVxuICAgICAgICAgICAgXSksIC8vdGFibGVcbiAgICAgICAgICAgIG0oJy5hY3Rpb25zJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXByaW1hcnknLCB7IG9uY2xpY2s6IGN0cmwuc3RhcnRjcmVhdGUgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpLmZhLmZhLXBsdXMnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICfQlNC+0LHQsNCy0LjRgtGMINGC0L7QstCw0YAnKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5wdWxsLXJpZ2h0JywgbS5jb21wb25lbnQoUGFnZVNpemVTZWxlY3RvciwgY3RybC5wYWdlc2l6ZSkpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGN0cmwudm0ubGlzdCgpID8gbS5jb21wb25lbnQoUGFnaW5hdG9yLCB7bGlzdDogY3RybC52bS5saXN0LCBwYWdlc2l6ZTogY3RybC5wYWdlc2l6ZSwgY3VycmVudHBhZ2U6IGN0cmwuY3VycmVudHBhZ2UsIG9uc2V0cGFnZTogY3RybC5jdXJyZW50cGFnZX0pIDogXCJcIixcbiAgICAgICAgXSlcbiAgICBdKVxufSJdfQ==
