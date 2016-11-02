package models

import (
	"fmt"

	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

//User type contains user info
type User struct {
	gorm.Model
	Email    string `json:"email" gorm:"unique_index"`
	Name     string `json:"name"`
	Password string `json:"-"`
}

//UserJ type contains user info
type UserJ struct {
	gorm.Model
	Email           string `json:"email" binding:"required"`
	Name            string `json:"name" binding:"required"`
	CurrentPassword string `json:"current_password"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"password_confirm"`
}

//Signin type contains login information
type Signin struct {
	Email    string `form:"email" binding:"required"`
	Password string `form:"password" binding:"required"`
}

//Signup type contains registration information
type Signup struct {
	Email           string `form:"email" binding:"required"`
	Password        string `form:"password" binding:"required"`
	PasswordConfirm string `form:"password_confirm" binding:"required"`
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

func (user *User) BeforeDelete() (err error) {
	count := 0
	db.Model(&User{}).Count(&count)
	if count == 1 {
		return fmt.Errorf("Невозможно удалить последнего пользователя")
	}
	return
}
