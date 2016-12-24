package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
	"github.com/gin-gonic/gin"
)

func ApiImageGet(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	image := &models.Image{}
	db.Find(image, id)
	if image.ID == 0 {
		c.JSON(404, "Указанное изображение не найдено")
		return
	}

	c.JSON(200, image)
}

func ApiImageCreate(c *gin.Context) {
	db := models.GetDB()

	err := c.Request.ParseMultipartForm(32 << 20)
	if err != nil {
		c.String(500, err.Error())
		return
	}
	mpartFile, mpartHeader, err := c.Request.FormFile("upload")
	if err != nil {
		c.String(400, err.Error())
		return
	}
	defer mpartFile.Close()
	uri, err := saveFile(mpartHeader, mpartFile)
	if err != nil {
		c.String(400, err.Error())
		return
	}

	image := &models.Image{URI: uri}
	if err := db.Create(image).Error; err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusCreated, image)
}

func ApiImageDelete(c *gin.Context) {
	db := models.GetDB()
	id := c.Param("id")

	image := &models.Image{}
	db.First(image, id)
	if image.ID == 0 {
		c.JSON(404, "Изображение с указанным номером не найдено")
		return
	}

	os.Remove(filepath.Join(system.GetConfig().Uploads, filepath.Base(image.URI)))
	if err := db.Delete(image).Error; err != nil {
		c.JSON(500, fmt.Sprintf("Ошибка при удалении записи: %s", err.Error()))
		return
	}
	c.JSON(200, nil)
}
