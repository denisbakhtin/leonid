'use strict';
/*global m */

import {mrequest, parseError, displayfor, metadata, inputfor, pages, sorts, getCookie, setCookie} from "../helpers/functions"
import {Model} from "../helpers/model"
import {Spinner} from "../layout/spinner"
import {PageSizeSelector} from "../layout/pagesizeselector"
import {Paginator} from "../layout/paginator"
import {Category} from "./categorygrid"

export var CategorySelect = {}
CategorySelect.vm = {}
CategorySelect.vm.init = function(args) {
    args = args || {}
    var vm = this
    vm.list = mrequest({ method: "GET", url: "/api/categories", type: Category })
    return this
}

//args: {value: m.prop, error: m.prop optional}
CategorySelect.controller = function(args) {
    args = args || {}
    var ctrl = this
    ctrl.value = args.value
    ctrl.vm = CategorySelect.vm.init()
    ctrl.vm.list.then(function(data){ if (data.length) ctrl.value(data[0].id()) }) //initial value
    ctrl.error = args.error || m.prop('')
}
CategorySelect.view = function(ctrl, args) {
    return m("select.form-control", {
            onchange: m.withAttr("value", ctrl.value)
        },
        ctrl.vm.list() 
        ? ctrl.vm.list().map(function(data){
            return m('option', {value: data.id()}, data.name())
        })
        : ""
    )
}