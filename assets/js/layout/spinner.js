'use strict'

var LoadingSpinner = {}

LoadingSpinner.controller = function() {}
LoadingSpinner.view = function(ctrl) {
    return m('#loading-spinner.animated.fadeIn', [
        m('p.text-center', m('i.fa.fa-spin.fa-cog.fa-3x')),
        m('p.text-center', 'Подождите, идет загрузка...')
    ])
}

var UpdatingSpinner = {}

UpdatingSpinner.controller = function(args) {}
UpdatingSpinner.view = function(ctrl, args) {
    return m('#updating-spinner.animated.fadeIn', [
        m('p#spinner-text', m('i.fa.fa-spin.fa-cog.fa-3x')),
    ])
}

export var Spinner = {}
Spinner.controller = function(args) {
    var ctrl = this
    ctrl.standalone = (args && args.standalone) ? true : false;
}
Spinner.view = function(ctrl, args) {
    return m('#spinner', 
        (ctrl.standalone) 
        ? m.component(LoadingSpinner) 
        : m.component(UpdatingSpinner)
    )
}