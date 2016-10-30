'use strict';

import {config} from '../helpers/functions'

function layout(component) {
    function logout() {
        m.request({
            method: "POST", 
            url: "/api/logOff", 
        }).then((success) => {window.location = "/";})
    }

    var header = m("nav.navbar.navbar-default", [
        m('.container-fluid', [
            m('.navbar-header', [
                m('button.navbar-toggle.collapsed[type="button" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false"]', [
                    m('span.sr-only', "Toggle navigation"),
                    m('span.icon-bar'),
                    m('span.icon-bar'),
                    m('span.icon-bar')
                ]),
                m('a.navbar-brand[href="#"]', config.brandAdmin)
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
        ])
    ])

    var navlink = function (url, title) {
        return m('li', { class: (m.route().includes(url)) ? "active" : "" }, m('a', { href: url, config: m.route }, title))
    }
    var sidebar = [
        m('.panel.panel-default', [
            m('ul.nav nav-pills nav-stacked', [
                navlink("/categories", "Категории товаров"),
                navlink("/products", "Товары"),
                navlink("/account", "Учетная запись"),
            ])
        ])
    ]

    var footer = [
        m('footer#footer', [
            m('.container', [
                m('div', "Подвал сайта")
            ])
        ])
    ]
    return [
        header,
        m("#content-wrapper.container", [
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

export function withLayout(component) {
    return { controller: function () { }, view: mixinLayout(layout, component) }
}