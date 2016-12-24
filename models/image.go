package models

// type contains category info
type Image struct {
	ID  uint   `json:"id"`
	URI string `json:"uri"`
	//relations
	ProductID uint `gorm:"index" json:"product_id"`
	Product   Product
}
