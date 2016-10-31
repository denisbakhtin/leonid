package models

import "github.com/jinzhu/gorm"

// type contains category info
type Category struct {
	gorm.Model
	Name      string
	Slug      string
	Content   string
	Published bool
	//relations
	Products []Product
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
