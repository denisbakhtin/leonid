package models

import (
	"fmt"
	"html/template"
	"strings"
)

//Page type contains page info
type Page struct {
	ID        uint   `json:"id"`
	Name      string `json:"name" binding:"required"`
	Slug      string `json:"slug"`
	Content   string `json:"content"`
	Published bool   `json:"published" binding:"required"`
}

func (page *Page) URL() string {
	return fmt.Sprintf("/pages/%s", page.Slug)
}

func (page *Page) HTMLContent() template.HTML {
	return template.HTML(page.Content)
}

func (page *Page) BeforeCreate() (err error) {
	page.Slug = strings.TrimSpace(page.Slug)
	if page.Slug == "" {
		page.Slug = createSlug(page.Name)
	}
	return
}

func (page *Page) BeforeSave() (err error) {
	page.Slug = strings.TrimSpace(page.Slug)
	if page.Slug == "" {
		page.Slug = createSlug(page.Name)
	}
	return
}
