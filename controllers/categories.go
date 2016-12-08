package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/denisbakhtin/leonid/models"
	"github.com/gin-gonic/gin"
)

func CategoryGet(c *gin.Context) {
	db := models.GetDB()
	H := H(c)

	idslug := strings.SplitN(c.Param("idslug"), "-", 2)
	category := &models.Category{}

	if err := db.First(category, idslug[0]).Error; err != nil {
		c.HTML(500, "errors/500", gin.H{})
		return
	}

	if category.ID == 0 || !category.Published {
		c.HTML(404, "errors/404", gin.H{})
		return
	}

	if category.Slug != idslug[1] {
		c.Redirect(303, category.URL())
		return
	}

	H["Title"] = category.Name
	H["Category"] = category
	H["MetaDescription"] = category.MetaDescription
	H["MetaKeywords"] = category.MetaKeywords
	c.HTML(200, "categories/show", H)

}

func ApiCategoriesGet(c *gin.Context) {
	db := models.GetDB()

	var categories []models.Category
	if err := db.Order("id desc").Find(&categories).Error; err != nil {
		c.JSON(500, "Внутренняя ошибка сервера")
		return
	}

	c.JSON(200, categories)
}

func ApiCategoryGet(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	category := &models.Category{}
	db.Find(category, id)
	if category.ID == 0 {
		c.JSON(404, "Указанная страница не найдена")
		return
	}

	c.JSON(200, category)
}

func ApiCategoryCreate(c *gin.Context) {
	db := models.GetDB()
	category := &models.Category{}
	if c.BindJSON(category) == nil {
		if err := db.Create(category).Error; err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		c.JSON(http.StatusCreated, category)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
	}
}

func ApiCategoryUpdate(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")
	category := &models.Category{}

	if c.BindJSON(category) == nil {
		categoryDB := &models.Category{}
		db.Find(categoryDB, id)
		if categoryDB.ID == 0 {
			c.JSON(404, "Указанная страница не найдена")
			return
		}

		if err := db.Save(category).Error; err != nil {
			c.JSON(500, fmt.Errorf("Ошибка при сохранении записи: %s", err.Error()))
			return
		}
		c.JSON(200, nil)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
		return
	}
}

func ApiCategoryDelete(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	category := &models.Category{}
	db.First(category, id)
	if category.ID == 0 {
		c.JSON(404, "Страница с указанным номером не найдена")
		return
	}

	if err := db.Delete(category).Error; err != nil {
		c.JSON(500, fmt.Sprintf("Ошибка при удалении записи: %s", err.Error()))
		return
	}
	c.JSON(200, nil)
}
