'use strict';
/*global m */
import {mrequest, metadata, labelfor, inputfor, joinErrors} from "../helpers/functions"
import {Spinner} from "../layout/spinner"

var Password = function(data){
    data = data || {}
    this.currentpassword = m.prop(data.currentPassword|| '')
    this.password = m.prop(data.password|| '')
    this.passwordconfirm = m.prop(data.passwordConfirm || '')
    this.meta = m.prop(metadata(data.meta))
    this.__RequestVerificationToken = m.prop(gettoken())
}

export var ManagePassword = {}
ManagePassword.vm = {}
ManagePassword.vm.init = function() {
    this.record = mrequest({ background: true, method: "GET", url: "/api/managepassword", type: Password })
    this.record.then(m.redraw)
    return this
}
ManagePassword.controller = function () {
    var ctrl = this
    ctrl.vm = ManagePassword.vm.init()
    ctrl.title = document.title = "Изменить пароль"
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
        mrequest({ method: "PUT", url: "/api/managepassword", data: record() }).then(
            (success) => { ctrl.updating(false); ctrl.message('Изменения успешно сохранены') },
            (error) => { ctrl.updating(false); ctrl.error("Ошибка! " + joinErrors(error)) }
        )
        return false //preventDefault
    }
}
ManagePassword.view = function (ctrl) {
    return m("#managepassword", [
        m("h1", ctrl.title),
        ctrl.vm.record() 
        ? m('form.animated.fadeIn', [
            m('.row', [
                m('.form-group.col-md-4', [
                    labelfor('currentpassword', ctrl.vm.record),
                    inputfor('currentpassword', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('password', ctrl.vm.record),
                    inputfor('password', ctrl.vm.record)
                ]),
                m('.form-group.col-md-4', [
                    labelfor('passwordconfirm', ctrl.vm.record),
                    inputfor('passwordconfirm', ctrl.vm.record)
                ]),
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
