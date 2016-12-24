'use strict';
/*global m */

var funcs = require("../helpers/funcs");
var Model = require("../helpers/model");
var Spinner = require("../layout/spinner");
var Image = require('./image');
var ImageComponent = require('./imagecomponent');

var ImagesComponent = {};
ImagesComponent.vm = {};
ImagesComponent.vm.init = function(list) {
  var vm = this;
  vm.list = list;
  return this;
}
//list = array of Image()'s
ImagesComponent.controller = function (list) {
  var ctrl = this;

  ctrl.vm = ImagesComponent.vm.init(list);
  ctrl.updating = m.prop(false); //waiting for data update in background
  ctrl.error = m.prop('');

  ctrl.ondelete = function(index) {
    ctrl.vm.list.splice(index, 1);
  }
  ctrl.create = function() {
    ctrl.updating(true);
    var file = document.getElementById('upload_image_input').files[0];
    var data = new FormData();
    data.append('upload', file);
    document.getElementById('upload_image_input').value = ""; //clear
    funcs.mrequest({
      method: 'POST', 
      url: '/api/images', 
      data: data, 
      serialize: function(data) {return data}
    }).then(
      function(success) {
        ctrl.vm.list.push(new Image(success));
        ctrl.updating(false);
      },
      function(error) {
        ctrl.error(error);
        ctrl.updating(false);
      });
  }
}
ImagesComponent.view = function (ctrl) {
  return m("#imagelist", 
      m('#images', 
        ctrl.vm.list.map(function(data, index){
          return m.component(ImageComponent, {key: index, image: data, error: ctrl.error, ondelete: ctrl.ondelete.bind(ctrl, index)});
        }),
        ctrl.updating() ? m.component(Spinner) : ""),
      m('.file-upload-wrapper', 
        m('input#upload_image_input[type=file]', {onchange: ctrl.create})));
}

module.exports = ImagesComponent;
