package controllers

import (
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

//Home handles GET / route
func Home(c *gin.Context) {
	session := sessions.Default(c)
	H := H(c)
	H["Title"] = "Вечная память приветствует Вас"
	H["Active"] = "/"
	session.Save()
	c.HTML(200, "home/show", H)
}
