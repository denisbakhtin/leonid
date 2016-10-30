'use strict';
/*global m */

import {mrequest, parseError, displayfor, metadata, inputfor, pages, sorts, getCookie, setCookie} from "../helpers/functions"
import {Model} from "../helpers/model"
import {Spinner} from "../layout/spinner"
import {PageSizeSelector} from "../layout/pagesizeselector"
import {Paginator} from "../layout/paginator"
import {Product} from "./product"

export var ProductList = {}
ProductList.vm = {}
ProductList.vm.init = function(args) {
    args = args || {}
    var vm = this
    vm.model = new Model({url: "/api/products", type: Product})
    vm.list = vm.model.index()
    return this
}
ProductList.controller = function () {
    var ctrl = this

    ctrl.vm = ProductList.vm.init()
    ctrl.updating = m.prop(true) //waiting for data update in background
    ctrl.vm.list.then(function() {ctrl.updating(false); m.redraw();}) //hide spinner and redraw after data arrive 
    ctrl.title = document.title = "Список товаров"
    ctrl.pagesize = m.prop(getCookie("pagesize") || 10) //number of items per page
    ctrl.currentpage = m.prop(0) //current page, starting with 0
    ctrl.error = m.prop('')

    ctrl.startedit = function(row) {
        console.log('Use m.route to redirect')
    }
    ctrl.startcreate = function(row) {
        m.route("/products/new")
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
}
ProductList.view = function (ctrl) {

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
        )
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
    ])
}