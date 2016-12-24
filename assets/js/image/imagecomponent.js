'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var Image = require("./image");

var ImageComponent = {};

//args: {image: m.prop(Image(..)), error: m.prop(), ondelete: callback function}
ImageComponent.controller = function (args) {
  var ctrl = this;

  ctrl.delete = function() {
    funcs.mrequest({method: "DELETE", url: "/api/images/" + args.image.id()})
      .then(
          function(success){args.ondelete();},
          function(error){args.error(error);});
  }
}
ImageComponent.view = function (ctrl, args) {

  return m(".imagecomponent.thumbnail", 
      m('img', {src: args.image.uri()}),
      m('span.fa.fa-times', {onclick: ctrl.delete, title: "Удалить"}));
}

module.exports = ImageComponent;
