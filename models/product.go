package models

import (
	"fmt"

	"github.com/jinzhu/gorm"
)

//Product type contains product info
type Product struct {
	gorm.Model
	Name      string
	Slug      string
	Content   string
	Image     string
	Published bool
	//relations
	CategoryID int `gorm:"index"`
	Category   Category
}

func (product *Product) URL() string {
	return fmt.Sprintf("/products/%d-%s", product.ID, product.Slug)
}
