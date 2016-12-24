package controllers

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/denisbakhtin/leonid/system"
	"github.com/gin-gonic/gin"
)

//Upload handles POST /api/upload route
func Upload(c *gin.Context) {
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
	resp := make(map[string]string)
	resp["uri"] = uri
	c.JSON(200, resp)
}

//saveFile saves file to disc and returns its relative uri
func saveFile(fh *multipart.FileHeader, f multipart.File) (string, error) {
	fileExt := strings.ToLower(filepath.Ext(fh.Filename))
	if !regexp.MustCompile("^\\.(jpe?g|bmp|gif|png)$").MatchString(fileExt) {
		return "", fmt.Errorf("File is not an image")
	}
	newName := fmt.Sprint(time.Now().Unix()) + fileExt //unique file name ;D
	uri := "/public/uploads/" + newName
	fullName := filepath.Join(system.GetConfig().Uploads, newName)

	if err := os.MkdirAll(system.GetConfig().Uploads, 0755); err != nil {
		return "", err
	}
	file, err := os.OpenFile(fullName, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return "", err
	}
	defer file.Close()
	_, err = io.Copy(file, f)
	if err != nil {
		return "", err
	}
	return uri, nil
}
