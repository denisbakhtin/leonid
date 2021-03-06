package system

import (
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func Authenticated() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		if session.Get("user_id") != nil {
			c.Set("user_id", session.Get("user_id"))
			c.Next()
		} else {
			c.AbortWithStatus(403)
		}
	}
}
