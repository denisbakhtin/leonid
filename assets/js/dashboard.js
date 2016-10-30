'use strict';
/*global m */

export var dashboard = {
    controller: function () {
        document.title = "Панель администратора"
        return { title: "Dashboard Title $1" }
    },
    view: function (ctrl) {
        return m("h1", ctrl.title)
    }
}