package controllers

import (
	"net/http"
	"strings"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func SignInGet(c *gin.Context) {
	session := sessions.Default(c)
	H := helpers.H(c)
	H["Title"] = "Вход в систему"
	session.Save()
	c.HTML(http.StatusOK, "auth/signin", H)
}

func SignInPost(c *gin.Context) {
	session := sessions.Default(c)
	signin := models.Signin{}
	db := models.GetDB()

	if c.Bind(&signin) == nil {
		//check existence
		userDB := &models.User{}
		db.Where("email = lower(?)", signin.Email).First(userDB)
		if userDB.ID == 0 || userDB.ComparePassword(signin.Password) != nil {
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
	H := helpers.H(c)
	H["Title"] = "Регистрация в системе"
	session.Save()
	c.HTML(200, "auth/signup", H)
}

func SignUpPost(c *gin.Context) {
	session := sessions.Default(c)
	db := models.GetDB()
	signup := &models.Signup{}
	if c.Bind(signup) == nil {
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

func Logout(c *gin.Context) {
	session := sessions.Default(c)
	session.Delete("user_id")
	session.Save()
	c.Redirect(303, "/")
}

func ApiLogout(c *gin.Context) {
	session := sessions.Default(c)
	session.Delete("user_id")
	session.Save()
	c.JSON(200, nil)
}
