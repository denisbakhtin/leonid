package controllers

import (
	"fmt"
	"net/http"

	"github.com/denisbakhtin/leonid/models"
	"github.com/gin-gonic/gin"
)

func ProductGet(c *gin.Context) {
	db := models.GetDB()

	slug := c.Param("slug")
	product := &models.Product{}

	if err := db.Where("slug = ?", slug).First(product).Error; err != nil {
		c.HTML(500, "errors/500", gin.H{})
		return
	}

	if !product.Published {
		c.HTML(404, "errors/404", gin.H{})
		return
	}

	c.HTML(200, "products/show", gin.H{
		"Product": product,
		"Title":   product.Name,
		"Active":  product.URL(),
	})

}

func ApiProductsGet(c *gin.Context) {
	db := models.GetDB()

	var products []models.Product
	if err := db.Find(&products).Error; err != nil {
		c.JSON(500, "Внутренняя ошибка сервера")
		return
	}

	c.JSON(200, products)
}

func ApiProductGet(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	product := &models.Product{}
	db.Find(product, id)
	if product.ID == 0 {
		c.JSON(404, "Указанный товар не найден")
		return
	}

	c.JSON(200, product)
}

func ApiProductCreate(c *gin.Context) {
	db := models.GetDB()
	product := &models.Product{}
	if c.BindJSON(product) == nil {
		if err := db.Create(product).Error; err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		c.JSON(http.StatusCreated, product)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
	}
}

func ApiProductUpdate(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")
	product := &models.Product{}

	if c.BindJSON(product) == nil {
		productDB := &models.Product{}
		db.Find(productDB, id)
		if productDB.ID == 0 {
			c.JSON(404, "Указанный товар не найден")
			return
		}

		if err := db.Save(product).Error; err != nil {
			c.JSON(500, fmt.Errorf("Ошибка при сохранении записи: %s", err.Error()))
			return
		}
		c.JSON(200, nil)

	} else {
		c.JSON(http.StatusBadRequest, "Внимательно проверьте заполнение всех полей")
		return
	}
}

func ApiProductDelete(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	product := &models.Product{}
	db.First(product, id)
	if product.ID == 0 {
		c.JSON(404, "Товар с указанным номером не найден")
		return
	}

	if err := db.Delete(product).Error; err != nil {
		c.JSON(500, fmt.Sprintf("Ошибка при удалении записи: %s", err.Error()))
		return
	}
	c.JSON(200, nil)
}
