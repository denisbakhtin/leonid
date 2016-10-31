package models

import (
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

//User type contains user info
type User struct {
	gorm.Model
	Email    string `json:"email" gorm:"unique_index"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

//HashPassword substitutes User.Password with its bcrypt hash
func (user *User) HashPassword() error {
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hash)
	return nil
}

//ComparePassword compares User.Password hash with raw password
func (user *User) ComparePassword(password string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return err
	}
	return nil
}
