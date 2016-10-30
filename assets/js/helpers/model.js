'use strict'

import {mrequest} from "./functions"

//args: {url: "/api/example", type: ObjectType}
export var Model = function(args) {
    args = args || {}
    var model = this

    model.index = function() {
        return mrequest({
            background: true,
            method: "GET", 
            url: args.url, 
            type: args.type
        })
    }
    model.get = function(id) {
        return mrequest({
            background: true,
            method: "GET", 
            url: args.url + "/" + id,
            type: args.type
        })
    }
    model.create = function(data) {
        return mrequest ({
            background: true,
            method: "POST",
            url: args.url,
            data: data,
        })
    }
    model.update = function(data) {
        return mrequest({
            background: true,
            method: "PUT",
            url: args.url,
            data: data,
        })
    }
    model.delete = function(id) {
        return mrequest({
            background: true,
            method: "DELETE",
            url: args.url + "/" + id,
        })
    }
}

