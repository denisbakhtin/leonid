'use strict';
/*global m */
import {mrequest, metadata, labelfor, inputfor, joinErrors} from "../helpers/functions"
import {Spinner} from "../layout/spinner"

var User = function(data){
    data = data || {}
    this.email = m.prop(data.email|| '')
    this.firstname = m.prop(data.firstName || '')
    this.lastname = m.prop(data.lastName || '')
    this.middlename = m.prop(data.middleName || '')
    this.birthdate = m.prop( (data.birthDate) ? data.birthDate.split('T')[0] : '')
    this.country = m.prop(data.country || '')
    this.city = m.prop(data.city || '')
    this.address = m.prop(data.address || '')
    this.zip = m.prop(data.zip || '')
    this.company = m.prop(data.company || '')
    this.position = m.prop(data.position|| '')
    this.interests = m.prop(data.interests || '')
    this.meta = m.prop(metadata(data.meta))
    this.__RequestVerificationToken = m.prop(gettoken())
}

export var ManageUser = {}
ManageUser.vm = {}
ManageUser.vm.init = function() {
    this.record = mrequest({ background: true, method: "GET", url: "/api/manageuser", type: User })
    this.record.then(m.redraw)
    return this
}
ManageUser.controller = function () {
    var ctrl = this
    ctrl.vm = ManageUser.vm.init()
    ctrl.title = document.title = "Данные пользователя"
    ctrl.message = m.prop('') //notifications
    ctrl.error = m.prop('') //request errors
    ctrl.updating = m.prop(false) //request is being processed (show spinner & prevent double click)
    ctrl.onsubmit = function(record) {
        if (ctrl.updating())
            return false // prevent double event processing
        ctrl.message('')
        ctrl.error('')
        ctrl.updating(true)
        m.redraw()
        mrequest({ method: "PUT", url: "/api/manageuser", data: record()}).then(
            (success) => { ctrl.updating(false); ctrl.message('Изменения успешно сохранены') },
            (error) => { ctrl.updating(false); ctrl.error("Ошибка! " + joinErrors(error)) }
        )
        return false //preventDefault
    }
}
ManageUser.view = function (ctrl) {
    return m("#manageuser", [
        m("h1", ctrl.title),
        ctrl.vm.record() 
        ? m('form.animated.fadeIn', [
            m('.row', [
                m('.form-group.col-md-8', [
                    labelfor('email', ctrl.vm.record),
                    inputfor('email', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('birthdate', ctrl.vm.record),
                    inputfor('birthdate', ctrl.vm.record)
                ]),
            ]),
            m('.row', [
                m('.form-group.col-md-4', [
                    labelfor('firstname', ctrl.vm.record),
                    inputfor('firstname', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('middlename', ctrl.vm.record),
                    inputfor('middlename', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('lastname', ctrl.vm.record),
                    inputfor('lastname', ctrl.vm.record)
                ]),
            ]),
            m('.row', [
                m('.form-group.col-md-4', [
                    labelfor('country', ctrl.vm.record),
                    inputfor('country', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('city', ctrl.vm.record),
                    inputfor('city', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('zip', ctrl.vm.record),
                    inputfor('zip', ctrl.vm.record)
                ]),
            ]),
            m('.form-group', [
                labelfor('address', ctrl.vm.record),
                inputfor('address', ctrl.vm.record)
            ]),
            m('.row', [
                m('.form-group.col-md-6', [
                    labelfor('company', ctrl.vm.record),
                    inputfor('company', ctrl.vm.record)
                ]),
                m('.form-group.col-md-6', [
                    labelfor('position', ctrl.vm.record),
                    inputfor('position', ctrl.vm.record)
                ]),
            ]),
            m('.form-group', [
                labelfor('interests', ctrl.vm.record),
                inputfor('interests', ctrl.vm.record)
            ]),
            (ctrl.message()) ? m('.action-message.animated.fadeInRight', ctrl.message()) : "",
            (ctrl.error()) ? m('.action-alert.animated.fadeInRight', ctrl.error()) : "",
            m('.actions', [
                m('button.btn.btn-primary[type="submit"]', {
                    onclick: ctrl.onsubmit.bind(this, ctrl.vm.record),
                    disabled: ctrl.updating(),
                }, [
                    (ctrl.updating()) ? m('i.fa.fa-spin.fa-refresh') : m('i.fa.fa-check'),
                    m('span', 'Сохранить')
                ]),
            ])
        ])
        : m.component(Spinner, {standalone: true})
    ])
}
