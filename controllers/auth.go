package controllers

import (
	"net/http"
	"strings"

	"github.com/denisbakhtin/leonid/models"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func SignInGet(c *gin.Context) {
	session := sessions.Default(c)
	c.HTML(http.StatusOK, "auth/signin", gin.H{
		"Title":  "Вход в систему",
		"Active": "signin",
		"Flash":  session.Flashes(),
	})
	session.Save()
}

func SignInPost(c *gin.Context) {
	session := sessions.Default(c)
	signin := models.Signin{}
	db := models.GetDB()

	if c.Bind(&signin) == nil {
		user := &models.User{
			Email:    signin.Email,
			Password: signin.Password,
		}
		if err := user.HashPassword(); err != nil {
			session.AddFlash("Ошибка входа в систему, повторите попытку или сообщите администратору.")
			session.Save()
			c.Redirect(303, "/signin")
			return
		}
		//check existence
		userDB := &models.User{}
		db.Where(user).First(userDB)
		if userDB.ID == 0 {
			session.AddFlash("Адрес эл. почты или пароль указаны неверно")
			session.Save()
			c.Redirect(303, "/signin")
			return
		}

		session.Set("user_id", userDB.ID)
		session.Save()
		c.Redirect(303, "/")
	} else {
		session.AddFlash("Адрес эл. почты или пароль указаны неверно")
		session.Save()
		c.Redirect(303, "/signin")
	}
}

func SignUpGet(c *gin.Context) {
	session := sessions.Default(c)
	c.HTML(200, "auth/signup", gin.H{
		"Title":  "Регистрация в системе",
		"Active": "signup",
		"Flash":  session.Flashes(),
	})
	session.Save()
}

func SignUpPost(c *gin.Context) {
	session := sessions.Default(c)
	db := models.GetDB()
	signup := models.Signup{}
	if gin.Bind(&signup) == nil {
		user := &models.User{
			Email:    strings.ToLower(signup.Email),
			Password: signup.Password,
		}
		//check existence
		userDB := &models.User{}
		db.Where("lower(email) = ?", user.Email).First(userDB)
		if userDB.ID != 0 {
			session.AddFlash("Пользователь с такой эл. почтой уже существует")
			session.Save()
			c.Redirect(303, "/signup")
			return
		}
		//create user
		if err := user.HashPassword(); err != nil {
			session.AddFlash("Ошибка регистрации пользователя, повторите попытку или сообщите администратору.")
			session.Save()
			c.Redirect(303, "/signup")
			return
		}
		if err := db.Create(user).Error; err != nil {
			session.AddFlash("Ошибка регистрации пользователя, повторите попытку или сообщите администратору.")
			session.Save()
			c.Redirect(303, "/signup")
			return
		}
		session.Set("user_id", user.ID)
		session.Save()
		c.Redirect(303, "/")
	} else {
		session.AddFlash("Пожалуйста, заполните внимательно все поля")
		session.Save()
		c.Redirect(303, "/signup")
	}
}

func LogoutPost(c *gin.Context) {
	session := sessions.Default(c)
	session.Delete("user_id")
	session.Save()
	c.Redirect(303, "/")
}
