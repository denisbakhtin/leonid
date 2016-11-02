'use strict';

var Tabs = {};

//args is an array of objects {id: "tab id", title: "tab title", component: "component to be rendered in that tab"}
Tabs.controller = function(args) {
  var ctrl = this;
  ctrl.active = m.prop(args[0].id);
  ctrl.setactive = function(id) {
    ctrl.active(id);
  }
}

Tabs.view = function(ctrl, args) {
  return m('.tabs', [
      m('ul.nav.nav-tabs[role="tablist"]', 
        args.map(function(data) {
          return m('li[role="presentation"]', 
              {class: (ctrl.active() == data.id) ? "active" : ""}, 
              m('a', {
                id: data.id,
                "aria-controls": data.id,
                role: "tab",
                "data-toggle": "tab",
                href: "#" + data.id,
                onclick: ctrl.setactive.bind(this, data.id),
              }, data.title))
        })
      ),
      m('.tab-content', 
        args.map(function(data) {
          return (ctrl.active() == data.id)
            ? m('.tab-pane.active[role="tabpanel"]', {id: data.id}, m.component(data.component))
            : ""
        })
       )
    ]);
}

module.exports = Tabs;
