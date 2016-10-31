package controllers

import (
	"log"
	"net/http"

	"fmt"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
	"github.com/jinzhu/gorm"
)

//UserIndex handles GET /admin/users route
func UserIndex(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		var users []models.User
		if err := db.Find(&users).Error; err != nil {
			w.WriteHeader(500)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
			return
		}
		data["Title"] = "Пользователи"
		data["Active"] = "users"
		data["List"] = users
		tmpl.Lookup("users/index").Execute(w, data)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//UserCreate handles /admin/new_user route
func UserCreate(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		data["Title"] = "Новый пользователь"
		data["Active"] = "users"
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("users/form").Execute(w, data)

	} else if r.Method == "POST" {

		user := &models.User{
			Name:     r.PostFormValue("name"),
			Email:    r.PostFormValue("email"),
			Password: r.PostFormValue("password"),
		}

		if err := user.HashPassword(); err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		if err := db.Create(user).Error; err != nil {
			session.AddFlash(err.Error())
			session.Save(r, w)
			http.Redirect(w, r, "/admin/new_user", 303)
			return
		}
		http.Redirect(w, r, "/admin/users", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//UserUpdate handles /admin/edit_user/:id route
func UserUpdate(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		id := r.URL.Path[len("/admin/edit_user/"):]
		user := &models.User{}
		if err := db.Find(user, id).Error; err != nil {
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
			return
		}

		data["Title"] = "Редактировать пользователя"
		data["Active"] = "users"
		data["User"] = user
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("users/form").Execute(w, data)

	} else if r.Method == "POST" {

		user := &models.User{
			Model:    gorm.Model{ID: helpers.Atouint(r.PostFormValue("id"))},
			Name:     r.PostFormValue("name"),
			Email:    r.PostFormValue("email"),
			Password: r.PostFormValue("password"),
		}

		if err := user.HashPassword(); err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		if err := db.Save(user).Error; err != nil {
			session.AddFlash(err.Error())
			session.Save(r, w)
			http.Redirect(w, r, r.RequestURI, 303)
			return
		}
		http.Redirect(w, r, "/admin/users", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//UserDelete handles /admin/delete_user route
func UserDelete(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	db := models.GetDB()

	if r.Method == "POST" {

		user := &models.User{}
		id := r.PostFormValue("id")
		if err := db.Find(user, id).Error; err != nil || user.ID == 0 {
			err := fmt.Errorf("ПОльзователь под номером: %v не найден", id)
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
		}

		count := 0
		db.Model(&models.User{}).Count(&count)
		if count <= 1 {
			err := fmt.Errorf("Can't remove last user")
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		if err := db.Delete(user).Error; err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		http.Redirect(w, r, "/admin/users", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}
