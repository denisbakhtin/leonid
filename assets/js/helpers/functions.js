'use strict'

//table metadata
var Meta = function(data) {
    data = data || {}
    var me = this
    me.name = data.propertyName || ""
    me.displayname = data.displayName || ""
    me.type = data.dataTypeName || ""
    me.isrequired = data.isRequired || false
    me.isreadonly = data.isReadOnly || false
    me.placeholder = data.placeholder || ""
}

export var config = {
    brand: "Каталог ПРО",
    brandAdmin: "Панель администратора"
} 

export var metadata = function(meta) {
    let me = []
    if (meta) {
        for (let d of meta) {
            me.push(new Meta(d))
        }
    }
    return me
}

//name is a string name of property in model
//model - represents table record, should contain 'meta' property with table metadata description
export var labelfor = function(name, model) {
    if (model && typeof(model) == "function" && model().meta) {
        for (let me of model().meta()) {
            if (me.name.toLowerCase() === name.toLowerCase())
                return m('label', {"for": "#"+name}, (me.displayname) ? me.displayname : name)
        }
    }
    return m('label', {"for": "#"+name}, name)
}

export var inputfor = function(name, model) {
    if (model && typeof(model) == "function" && model().meta) {
        for (let me of model().meta()) {
            if (me.name.toLowerCase() === name.toLowerCase())
                return m('input.form-control', {
                    id: name, 
                    onchange: (me.isreadonly) ? null : m.withAttr("value", model()[name]), 
                    value: model()[name](),
                    disabled: me.isreadonly,
                    required: me.isrequired,
                    type: inputType(me)
                })
        }
    }
    return m('input.form-control', {id: name})
}

export var displayfor = function(name, model) {
    if (model && typeof(model) == "function" && model().meta) {
        for (let me of model().meta()) {
            if (me.name.toLowerCase() === name.toLowerCase())
                return (me.displayname) ? me.displayname : name
        }
    }
    return name
}

function inputType(me) {
    switch(me.type) {
        case "EmailAddress":
            return "email"
        case "Date":
            return "date"
        case "Password":
            return "password"
        default: 
            return ''
    }
}

export var parseError = function(errstr) {
    try {
        return joinErrors(JSON.parse(errstr))
    }
    catch(err) {
        return errstr //return as is
    }
}

export var joinErrors = function(errors) {
    if (typeof(errors) === "object") {
        let errstr = "";
        for (let key in errors) {
            if (typeof(errors[key]) === "object") {
                for (let ekey in errors[key]) {
                    errstr += errors[key][ekey] + ". "
                }
            }
        }
        return errstr
    } else 
        return errors 
}

export var pages = function(arlen, pagesize) {
    return Array(Math.floor(arlen/pagesize) + ((arlen%pagesize > 0) ? 1 : 0)).fill(0); //return empty array of pages
}

export var sorts = function(list) {
    return {
        onclick: function(e) {
            var prop = e.target.getAttribute("data-sort-by")
            if (prop) {
                var first = list[0]
                list.sort(function(a, b) {
                    return a[prop]() > b[prop]() ? 1 : a[prop]() < b[prop]() ? -1 : 0
                })
                if (first === list[0]) list.reverse()
            }
        }
    }
}

export var mrequest = function(args) {
    var nonJsonErrors = function(xhr) {
        return (xhr.status > 204 && xhr.responseText.length) 
            ? JSON.stringify(xhr.responseText) 
            : (xhr.responseText.length)
            ? xhr.responseText
            : null
    }
    args.extract = nonJsonErrors
    return m.request(args)
}

export var setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export var getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}