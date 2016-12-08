package models

import (
	"fmt"
	"html/template"
	"strings"
)

//Page type contains page info
type Page struct {
	ID              uint   `json:"id"`
	Name            string `json:"name" binding:"required"`
	Slug            string `json:"slug"`
	Content         string `json:"content"`
	Published       bool   `json:"published"`
	MetaDescription string `json:"meta_description"`
	MetaKeywords    string `json:"meta_keywords"`
}

func (page *Page) URL() string {
	return fmt.Sprintf("/page/%d-%s", page.ID, page.Slug)
}

func (page *Page) EditURL() string {
	return fmt.Sprintf("/admin#/pages/%d", page.ID)
}

func (page *Page) HTMLContent() template.HTML {
	return template.HTML(page.Content)
}

func (page *Page) BeforeCreate() (err error) {
	if strings.TrimSpace(page.Slug) == "" {
		page.Slug = createSlug(page.Name)
	}
	return
}

func (page *Page) BeforeSave() (err error) {
	if strings.TrimSpace(page.Slug) == "" {
		page.Slug = createSlug(page.Name)
	}
	return
}
