'use strict';
/*global m */

import {mrequest, parseError, displayfor, metadata, labelfor, inputfor, pages, sorts, getCookie, setCookie} from "../helpers/functions"
import {Model} from "../helpers/model"
import {Spinner} from "../layout/spinner"
import {PageSizeSelector} from "../layout/pagesizeselector"
import {Paginator} from "../layout/paginator"
import {Category} from "./categorygrid"
import {CategorySelect} from "./categoryselect"

export var Product = function(data){
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

export var ProductPage = {}
ProductPage.vm = {}
ProductPage.vm.init = function() {
    var vm = this
    vm.model = new Model({url: "/api/products", type: Product})
    vm.record =  vm.model.get(m.route.param("id"))
    return this
}
ProductPage.controller = function () {
    var ctrl = this

    ctrl.vm = ProductPage.vm.init()
    ctrl.updating = m.prop(true) //waiting for data update in background
    ctrl.vm.record.then(function() {ctrl.updating(false); m.redraw();}) //hide spinner and redraw after data arrive 
    ctrl.title = document.title = (m.route.param("id") == "new") ? "Создание нового товара" : "Карточка товара"
    ctrl.error = m.prop('')
    ctrl.message = m.prop('') //notifications

    ctrl.update = function() {
        ctrl.updating(true)
        m.redraw()
        ctrl.vm.model.update(ctrl.vm.record)
        .then(
            (success) => ctrl.message('Изменения успешно сохранены'),
            (error) => ctrl.error(parseError(error))
        ).then(() => {ctrl.updating(false); m.redraw()})
    }
    ctrl.create = function() {
        ctrl.updating(true)
        m.redraw()
        ctrl.vm.model.create(ctrl.vm.record).then(
            (success) => m.route("/products"),
            (error) => {
                ctrl.error(parseError(error))
                ctrl.updating(false); 
                m.redraw()
            }
        )
    }
    ctrl.delete = function() {
        ctrl.updating(true)
        ctrl.vm.model.delete(ctrl.vm.record.id()).then(
            (success) => m.route("/products"),
            (error) => {
                ctrl.error(parseError(error))
                ctrl.updating(false)
                m.redraw()
            }
        )
    }
}
ProductPage.view = function (ctrl) {

    //complete view
    return m("#categorylist", [
        m("h1", ctrl.title),
        ctrl.vm.record()
        ? m('form.animated.fadeIn', [
            m('.form-group', [
                labelfor('name', ctrl.vm.record),
                inputfor('name', ctrl.vm.record)
            ]),
            m('.form-group', [
                labelfor('image', ctrl.vm.record),
                inputfor('image', ctrl.vm.record) //filefor
            ]),
            m('.form-group', [
                labelfor('categoryid', ctrl.vm.record),
                m.component(CategorySelect, {value: ctrl.vm.record().categoryid, error: ctrl.error})
            ]),
            m('.form-group', [
                labelfor('ispublished', ctrl.vm.record),
                inputfor('ispublished', ctrl.vm.record) //checkboxfor
            ]),
            m('.form-group', [
                labelfor('price', ctrl.vm.record),
                inputfor('price', ctrl.vm.record)
            ]),
            m('.form-group', [
                labelfor('description', ctrl.vm.record),
                inputfor('description', ctrl.vm.record) //textareafor
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
                    m('button.btn.btn-danger', { onclick: ctrl.delete, disabled: ctrl.updating() }, [
                        m('i.fa.fa-remove'),
                        m('span', 'Удалить')
                    ]),
                ]
            ])
        ])
        : m.component(Spinner, {standalone: true})
    ])
}