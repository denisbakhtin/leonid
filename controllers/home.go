package controllers

import (
	"net/http"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

//Home handles GET / route
func Home(c *gin.Context) {
	session := sessions.Default(c)
	H := helpers.H(c)
	H["Title"] = "Вечная память приветствует Вас"
	session.Save()
	c.HTML(http.StatusOK, "home/show", H)
}
