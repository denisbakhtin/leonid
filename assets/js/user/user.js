'use strict';

module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.ID || 0);
  this.name = m.prop(data.name || '');
  this.email = m.prop(data.email || '');
  this.current_password = m.prop(data.current_password || '');
  this.password = m.prop(data.password || '');
  this.password_confirm = m.prop(data.password_confirm || '');
}
