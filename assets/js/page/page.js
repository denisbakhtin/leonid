'use strict';


module.exports = function(data){
  data = data || {};
  this.id = m.prop(data.id || 0);
  this.name = m.prop(data.name || '');
  this.slug = m.prop(data.slug || '');
  this.content = m.prop(data.content || '');
  this.published = m.prop(data.published || true);
  this.meta_description = m.prop(data.meta_description || '');
  this.meta_keywords = m.prop(data.meta_keywords || '');
}
