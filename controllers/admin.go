package controllers

import (
	"github.com/denisbakhtin/leonid/helpers"
	"github.com/gin-gonic/gin"
)

//Dashboard handles GET /admin route
func AdminGet(c *gin.Context) {
	c.HTML(200, "admin", helpers.H(c))
}
