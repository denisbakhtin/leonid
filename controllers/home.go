package controllers

import (
	"net/http"

	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

//Home handles GET / route
func Home(c *gin.Context) {
	session := sessions.Default(c)
	c.HTML(http.StatusOK, "home/show", gin.H{
		"Title":   "Вечная память приветствует Вас",
		"Active":  "/",
		"Flashes": session.Flashes(),
	})
	session.Save()
}
