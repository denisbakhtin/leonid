package controllers

import (
	"fmt"
	"net/http"

	"github.com/denisbakhtin/leonid/models"
	"github.com/gin-gonic/gin"
)

func PageGet(c *gin.Context) {
	db := models.GetDB()

	slug := c.Param("slug")
	page := &models.Page{}

	if err := db.Where("slug = ?", slug).First(page).Error; err != nil {
		c.HTML(500, "errors/500", gin.H{})
		return
	}

	if !page.Published {
		c.HTML(404, "errors/404", gin.H{})
		return
	}

	c.HTML(200, "pages/show", gin.H{
		"Page":   page,
		"Title":  page.Name,
		"Active": page.URL(),
	})

}

func ApiPagesGet(c *gin.Context) {
	db := models.GetDB()

	var pages []models.Page
	if err := db.Find(&pages).Error; err != nil {
		c.JSON(500, "Внутренняя ошибка сервера")
		return
	}

	c.JSON(200, pages)
}

func ApiPageGet(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	page := &models.Page{}
	db.Find(page, id)
	if page.ID == 0 {
		c.JSON(404, "Указанная страница не найдена")
		return
	}

	c.JSON(200, page)
}

func ApiPageCreate(c *gin.Context) {
	db := models.GetDB()
	page := &models.Page{}
	if c.BindJSON(page) == nil {
		if err := db.Create(page).Error; err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		c.JSON(http.StatusCreated, page)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
	}
}

func ApiPageUpdate(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")
	page := &models.Page{}

	if c.BindJSON(page) == nil {
		pageDB := &models.Page{}
		db.Find(pageDB, id)
		if pageDB.ID == 0 {
			c.JSON(404, "Указанная страница не найдена")
			return
		}

		if err := db.Save(page).Error; err != nil {
			c.JSON(500, fmt.Errorf("Ошибка при сохранении записи: %s", err.Error()))
			return
		}
		c.JSON(200, nil)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
		return
	}
}

func ApiPageDelete(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	page := &models.Page{}
	db.First(page, id)
	if page.ID == 0 {
		c.JSON(404, "Страница с указанным номером не найдена")
		return
	}

	if err := db.Delete(page).Error; err != nil {
		c.JSON(500, fmt.Sprintf("Ошибка при удалении записи: %s", err.Error()))
		return
	}
	c.JSON(200, nil)
}
