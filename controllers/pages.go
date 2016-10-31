package controllers

import (
	"fmt"
	"log"
	"net/http"
	"regexp"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
	"github.com/jinzhu/gorm"
)

//PageShow handles /pages/:id route
func PageShow(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		re := regexp.MustCompile("^[0-9]+")
		id := re.FindString(r.URL.Path[len("/pages/"):])
		page := &models.Page{}

		if err := db.First(page, id).Error; err != nil || !page.Published {
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, nil)
			return
		}
		//redirect to canonical url
		if r.URL.Path != page.URL() {
			http.Redirect(w, r, page.URL(), http.StatusSeeOther)
			return
		}
		data["Page"] = page
		data["Title"] = page.Name
		data["Active"] = page.URL()
		tmpl.Lookup("pages/show").Execute(w, data)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//PageIndex handles GET /admin/pages route
func PageIndex(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		var pages []models.Page
		if err := db.Find(&pages).Error; err != nil {
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		data["Title"] = "Список страниц"
		data["Active"] = "pages"
		data["List"] = pages
		tmpl.Lookup("pages/index").Execute(w, data)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//PageCreate handles /admin/new_page route
func PageCreate(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		data["Title"] = "Новая страница"
		data["Active"] = "pages"
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("pages/form").Execute(w, data)

	} else if r.Method == "POST" {

		page := &models.Page{
			Name:      r.PostFormValue("name"),
			Slug:      r.PostFormValue("slug"),
			Content:   r.PostFormValue("content"),
			Published: helpers.Atob(r.PostFormValue("published")),
		}

		if err := db.Create(page).Error; err != nil {
			session.AddFlash(err.Error())
			session.Save(r, w)
			http.Redirect(w, r, "/admin/new_page", 303)
			return
		}
		http.Redirect(w, r, "/admin/pages", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//PageUpdate handles /admin/edit_page/:id route
func PageUpdate(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		id := r.URL.Path[len("/admin/edit_page/"):]
		page := &models.Page{}
		if err := db.Find(page, id).Error; err != nil {
			w.WriteHeader(400)
			tmpl.Lookup("errors/400").Execute(w, helpers.ErrorData(err))
			return
		}

		data["Title"] = "Редактировать страницу"
		data["Active"] = "pages"
		data["Page"] = page
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("pages/form").Execute(w, data)

	} else if r.Method == "POST" {

		page := &models.Page{
			Model:     gorm.Model{ID: helpers.Atouint(r.PostFormValue("id"))},
			Name:      r.PostFormValue("name"),
			Slug:      r.PostFormValue("slug"),
			Content:   r.PostFormValue("content"),
			Published: helpers.Atob(r.PostFormValue("published")),
		}

		if err := db.Save(page).Error; err != nil {
			session.AddFlash(err.Error())
			session.Save(r, w)
			http.Redirect(w, r, r.RequestURI, 303)
			return
		}
		http.Redirect(w, r, "/admin/pages", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//PageDelete handles /admin/delete_page route
func PageDelete(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	db := models.GetDB()

	if r.Method == "POST" {

		page := &models.Page{}
		id := r.PostFormValue("id")
		if err := db.First(page, id).Error; err != nil || page.ID == 0 {
			err := fmt.Errorf("Страница с номером: %v не найдена.", id)
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
		}

		if err := db.Delete(page).Error; err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		http.Redirect(w, r, "/admin/pages", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}
