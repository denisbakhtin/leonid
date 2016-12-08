package models

import (
	"fmt"
	"html/template"
	"strings"
)

// type contains category info
type Category struct {
	ID              uint   `json:"id"`
	Name            string `json:"name"`
	Slug            string `json:"slug"`
	Content         string `json:"content"`
	Published       bool   `json:"published"`
	MetaDescription string `json:"meta_description"`
	MetaKeywords    string `json:"meta_keywords"`
	//relations
	Products []Product
}

func (category *Category) URL() string {
	return fmt.Sprintf("/category/%d-%s", category.ID, category.Slug)
}

func (category *Category) EditURL() string {
	return fmt.Sprintf("/admin#/categories/%d", category.ID)
}

func (category *Category) HTMLContent() template.HTML {
	return template.HTML(category.Content)
}

func (category *Category) BeforeCreate() (err error) {
	if strings.TrimSpace(category.Slug) == "" {
		category.Slug = createSlug(category.Name)
	}
	return
}

func (category *Category) BeforeSave() (err error) {
	if strings.TrimSpace(category.Slug) == "" {
		category.Slug = createSlug(category.Name)
	}
	return
}

/*
//SearchCategories returns a slice of categories, matching query
func SearchCategories(query string) ([]Category, error) {
	var list []Category
	err := db.Select(
		&list,
		`SELECT * FROM categories
		WHERE to_tsvector('russian', name || ' ' || content) @@ to_tsquery('russian', $1) AND
		published=$2
		ORDER BY categories.id DESC`,
		query,
		true,
	)
	return list, err
}
*/
