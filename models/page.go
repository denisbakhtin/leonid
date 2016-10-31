package models

import (
	"fmt"

	"github.com/jinzhu/gorm"
)

//Page type contains page info
type Page struct {
	gorm.Model
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	Content   string `json:"content"`
	Published bool   `json:"published"`
}

func (page *Page) URL() string {
	return fmt.Sprintf("/pages/%d-%s", page.ID, page.Slug)
}
