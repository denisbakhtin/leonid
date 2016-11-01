package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/denisbakhtin/leonid/models"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

func ApiUsersGet(c *gin.Context) {
	db := models.GetDB()

	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(500, "Внутренняя ошибка сервера")
		return
	}

	c.JSON(200, users)
}

func ApiUserGet(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	user := &models.User{}
	db.Find(user, id)
	if user.ID == 0 {
		c.JSON(404, "Указанный пользователь не найден")
		return
	}

	c.JSON(200, user)
}

func ApiUserCreate(c *gin.Context) {
	db := models.GetDB()
	userj := &models.UserJ{}
	if c.BindJSON(userj) == nil && strings.TrimSpace(userj.Password) != "" {
		user := &models.User{
			Email:    userj.Email,
			Name:     userj.Name,
			Password: userj.Password,
		}
		if err := user.HashPassword(); err != nil {
			c.JSON(500, "Ошибка шифрования пароля")
			return
		}
		if err := db.Create(user).Error; err != nil {
			c.JSON(http.StatusBadRequest, fmt.Sprintf("Ошибка создания пользователя: %s", err.Error()))
			return
		}
		c.JSON(http.StatusCreated, user)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
	}
}

func ApiUserUpdate(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")
	userj := &models.UserJ{}

	if c.BindJSON(userj) == nil {
		userDB := &models.User{}
		db.Find(userDB, id)
		if userDB.ID == 0 {
			c.JSON(404, "Указанный пользователь не найден")
			return
		}
		user := &models.User{
			Model:    gorm.Model{ID: userj.ID},
			Name:     userj.Name,
			Email:    userj.Email,
			Password: userj.Password,
		}
		if err := user.HashPassword(); err != nil {
			c.JSON(500, "Ошибка шифрования пароля")
			return
		}
		if strings.TrimSpace(userj.Password) != "" {
			if userj.Password != userj.PasswordConfirm {
				c.JSON(http.StatusBadRequest, "Пароль и подтверждение пароля не совпадают")
				return
			}
			if user.Password != userDB.Password {
				c.JSON(http.StatusBadRequest, "Указан неверный текущий пароль")
				return
			}
		}

		if err := db.Save(user).Error; err != nil {
			c.JSON(500, fmt.Errorf("Ошибка при сохранении записи: %s", err.Error()))
			return
		}
		c.JSON(200, nil)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
		return
	}
}

func ApiUserDelete(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	user := &models.User{}
	db.First(user, id)
	if user.ID == 0 {
		c.JSON(404, "Пользователь с указанным номером не найден")
		return
	}

	if err := db.Delete(user).Error; err != nil {
		c.JSON(500, fmt.Sprintf("Ошибка при удалении записи: %s", err.Error()))
		return
	}
	c.JSON(200, nil)
}
