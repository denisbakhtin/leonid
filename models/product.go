package models

import (
	"fmt"

	"github.com/jinzhu/gorm"
)

//Product type contains product info
type Product struct {
	gorm.Model
	Name      string `json:"name" binding:"required"`
	Slug      string `json:"slug"`
	Content   string `json:"content"`
	Image     string `json:"image"`
	Published bool   `json:"published" binding:"required"`
	//relations
	CategoryID int      `gorm:"index" json:"category_id" binding:"required"`
	Category   Category `json:"category"`
}

func (product *Product) URL() string {
	return fmt.Sprintf("/products/%s", product.Slug)
}
