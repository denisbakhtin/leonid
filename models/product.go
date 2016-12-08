package models

import (
	"fmt"
	"html/template"
	"strings"
)

//Product type contains product info
type Product struct {
	ID              uint    `json:"id"`
	Name            string  `json:"name"`
	Slug            string  `json:"slug"`
	Content         string  `json:"content"`
	Image           string  `json:"image"`
	Published       bool    `json:"published"`
	Price           float32 `json:"price,string"`
	MetaDescription string  `json:"meta_description"`
	MetaKeywords    string  `json:"meta_keywords"`
	//relations
	CategoryID int      `gorm:"index" json:"category_id"`
	Category   Category `json:"category"`
}

func (product *Product) URL() string {
	return fmt.Sprintf("/product/%d-%s", product.ID, product.Slug)
}

func (product *Product) EditURL() string {
	return fmt.Sprintf("/admin#/products/%d", product.ID)
}

func (product *Product) HTMLContent() template.HTML {
	return template.HTML(product.Content)
}

func (product *Product) BeforeCreate() (err error) {
	if strings.TrimSpace(product.Slug) == "" {
		product.Slug = createSlug(product.Name)
	}
	return
}

func (product *Product) BeforeSave() (err error) {
	if strings.TrimSpace(product.Slug) == "" {
		product.Slug = createSlug(product.Name)
	}
	return
}
