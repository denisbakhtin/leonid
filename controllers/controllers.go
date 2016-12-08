package controllers

import (
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

//DefaultData returns common to all pages template data
func H(c *gin.Context) map[string]interface{} {
	session := sessions.Default(c)
	return map[string]interface{}{
		"Authenticated": (session.Get("user_id") != nil),
		"Url":           c.Request.RequestURI,
		"Title":         "", //page title
		"SignupEnabled": true,
		"Flashes":       session.Flashes(),
	}
}

//ErrorData returns template data for error
func ErrorData(err error) map[string]interface{} {
	return map[string]interface{}{
		"Title": err.Error(),
		"Error": err.Error(),
	}
}
