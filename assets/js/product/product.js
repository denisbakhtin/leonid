'use strict';

module.exports = function(data){
  data = data || {}
  this.id = m.prop(data.id || 0)
    this.name = m.prop(data.name || '')
    this.ispublished = m.prop(data.isPublished || false)
    this.categoryname = m.prop(data.categoryName || '')
    this.categoryid = m.prop(data.categoryId || 0)
    this.description = m.prop(data.description || '')
    this.image = m.prop(data.image || '')
    this.price = m.prop(data.price || null)
    this.meta = m.prop(metadata(data.meta))
    this.__RequestVerificationToken = m.prop(gettoken())
}
