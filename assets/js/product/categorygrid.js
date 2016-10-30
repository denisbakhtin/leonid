'use strict';
/*global m */

import {mrequest, parseError, displayfor, metadata, inputfor, pages, sorts, getCookie, setCookie} from "../helpers/functions"
import {Model} from "../helpers/model"
import {Spinner} from "../layout/spinner"
import {PageSizeSelector} from "../layout/pagesizeselector"
import {Paginator} from "../layout/paginator"

export var Category = function(data){
    data = data || {}
    this.id = m.prop(data.id || 0)
    this.name = m.prop(data.name || '')
    this.ispublished = m.prop(data.isPublished || false)
    this.__RequestVerificationToken = m.prop(gettoken())
}

export var CategoryGrid = {}
CategoryGrid.vm = {}
CategoryGrid.vm.init = function(args) {
    args = args || {}
    var vm = this
    vm.model = new Model({url: "/api/categories", type: Category})
    vm.list = vm.model.index()
    return this
}
CategoryGrid.controller = function () {
    var ctrl = this

    ctrl.vm = CategoryGrid.vm.init()
    ctrl.updating = m.prop(true) //waiting for data update in background
    ctrl.vm.list.then(function() {ctrl.updating(false); m.redraw();}) //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Категории товаров"
    ctrl.editingid = m.prop('') //id of the row, that is being edited
    ctrl.record = m.prop('') //temporary state of the row, that is being edited
    ctrl.pagesize = m.prop(getCookie("pagesize") || 10) //number of items per page
    ctrl.currentpage = m.prop(0) //current page, starting with 0
    ctrl.error = m.prop('')

    ctrl.startedit = function(row) {
        ctrl.editingid(row.id())
        ctrl.record = new Category({id: row.id(), isPublished: row.ispublished(), name: row.name()})
    }
    ctrl.update = function(row) {
        ctrl.updating(true)
        m.redraw()
        ctrl.vm.model.update(ctrl.record)
        .then(
            (success) => {
                ctrl.editingid('')
                ctrl.vm.list()[ctrl.vm.list().indexOf(row)] = ctrl.record //update current row in grid
            },
            (error) => ctrl.error(parseError(error))
        ).then(() => {ctrl.updating(false); m.redraw()})
    }
    ctrl.startcreate = function() {
        ctrl.editingid('new')
        ctrl.record = new Category({id: 0, isPublished: true, name: ''})
    }
    ctrl.create = function() {
        ctrl.updating(true)
        m.redraw()
        ctrl.vm.model.create(ctrl.record).then(
            (success) => {
                ctrl.vm.list = ctrl.vm.model.index()
                ctrl.vm.list.then(function(){
                    ctrl.editingid('');
                    ctrl.updating(false); 
                    m.redraw()
                })
            },
            (error) => {
                ctrl.error(parseError(error))
                ctrl.updating(false); 
                m.redraw()
            }
        )
    }
    ctrl.delete = function(row) {
        ctrl.updating(true)
        event.stopPropagation() //prevent tr.onclick trigger
        ctrl.vm.model.delete(row.id()).then(
            (success) => {
                ctrl.vm.list = ctrl.vm.model.index()
                ctrl.vm.list.then(function(){
                    if (ctrl.currentpage()+1 > pages(ctrl.vm.list().length, ctrl.pagesize()).length) {
                        ctrl.currentpage(Math.max(ctrl.currentpage()-1, 0))
                    }
                    ctrl.updating(false)
                    m.redraw()
                })
            },
            (error) => {
                ctrl.updating(false)
                m.redraw()
            }
        )
    }
    ctrl.canceledit = function(){ ctrl.editingid('') }
}
CategoryGrid.view = function (ctrl) {

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
        ]
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
        )
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
        ]
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
    ])
}