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
