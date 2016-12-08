package controllers

import "github.com/gin-gonic/gin"

//Dashboard handles GET /admin route
func AdminGet(c *gin.Context) {
	c.HTML(200, "admin", H(c))
}
