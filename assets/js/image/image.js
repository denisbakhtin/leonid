'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.uri = m.prop(data.uri || '');
}
