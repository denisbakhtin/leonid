'use strict';

var mrequest = require("./funcs").mrequest;

//args: {url: "/api/example", type: ObjectType}
module.exports = function(args) {
  args = args || {};
  var model = this;

  model.index = function() {
    return mrequest({
      background: true,
      method: "GET", 
      url: args.url, 
      type: args.type
    })
  };
  model.get = function(id) {
    return mrequest({
      background: true,
      method: "GET", 
      url: args.url + "/" + id,
      type: args.type
    })
  };
  model.create = function(data) {
    return mrequest ({
      background: true,
      method: "POST",
      url: args.url,
      data: data,
    })
  };
  model.update = function(data) {
    return mrequest({
      background: true,
      method: "PUT",
      url: args.url + "/" + data().id(),
      data: data,
    })
  };
  model.delete = function(id) {
    return mrequest({
      background: true,
      method: "DELETE",
      url: args.url + "/" + id,
    })
  };
}

