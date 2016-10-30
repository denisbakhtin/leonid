'use strict';
/*global m */
import {Tabs} from "../layout/tabs"
import {ManageUser} from "./manageuser"
import {ManagePassword} from "./managepassword"

export var Account = {}
Account.controller = function () {
    var ctrl = this
    ctrl.title = document.title = "Изменение учетной записи"
}
Account.view = function (ctrl) {
    return m("#account", [
        m("h1", ctrl.title),
        m.component(Tabs, [
            {id: "manageuser", title: "О пользователе", component: ManageUser},
            {id: "managepassword", title: "Пароль", component: ManagePassword}
        ])
    ])
}
