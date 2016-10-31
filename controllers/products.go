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

//ProductShow handles GET /products/:id-slug route
func ProductShow(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		re := regexp.MustCompile("^[0-9]+")
		id := re.FindString(r.URL.Path[len("/products/"):])
		product := &models.Product{}
		if err := db.First(product, id).Error; err != nil || !product.Published {
			w.WriteHeader(404)
			err := fmt.Errorf("Изделие с номером: %v не найдено.", id)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
			return
		}
		//redirect to canonical url
		if r.URL.Path != product.URL() {
			http.Redirect(w, r, product.URL(), http.StatusSeeOther)
			return
		}
		data["Product"] = product
		data["Title"] = product.Name
		data["Active"] = "/products"
		//data["MetaDescription"] = product.Excerpt
		//flashes
		tmpl.Lookup("products/show").Execute(w, data)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//ProductIndex handles GET /admin/products route
func ProductIndex(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		var products []models.Product
		if err := db.Find(&products).Error; err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		data["Title"] = "Список продукции"
		data["Active"] = "products"
		data["List"] = products
		tmpl.Lookup("products/index").Execute(w, data)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//ProductCreate handles /admin/new_product route
func ProductCreate(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		data["Title"] = "Новое изделие"
		data["Active"] = "products"
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("products/form").Execute(w, data)

	} else if r.Method == "POST" {

		r.ParseForm()
		product := &models.Product{
			Name:      r.PostFormValue("name"),
			Slug:      r.PostFormValue("slug"),
			Content:   r.PostFormValue("content"),
			Published: helpers.Atob(r.PostFormValue("published")),
		}

		if err := db.Create(product).Error; err != nil {
			session.AddFlash(err.Error())
			session.Save(r, w)
			http.Redirect(w, r, "/admin/new_product", 303)
			return
		}
		http.Redirect(w, r, "/admin/products", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//ProductUpdate handles /admin/edit_product/:id route
func ProductUpdate(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()
	if r.Method == "GET" {

		id := r.URL.Path[len("/admin/edit_product/"):]
		product := &models.Product{}
		if err := db.First(product, id).Error; err != nil || product.ID == 0 {
			err := fmt.Errorf("Изделие под номером: %v не найдено", id)
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
			return
		}

		data["Title"] = "Редактировать изделие"
		data["Active"] = "products"
		data["Product"] = product
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("products/form").Execute(w, data)

	} else if r.Method == "POST" {

		r.ParseForm()
		product := &models.Product{
			Model:     gorm.Model{ID: helpers.Atouint(r.PostFormValue("id"))},
			Name:      r.PostFormValue("name"),
			Slug:      r.PostFormValue("slug"),
			Content:   r.PostFormValue("content"),
			Published: helpers.Atob(r.PostFormValue("published")),
		}

		if err := db.Save(product).Error; err != nil {
			session.AddFlash(err.Error())
			session.Save(r, w)
			http.Redirect(w, r, r.RequestURI, 303)
			return
		}
		http.Redirect(w, r, "/admin/products", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//ProductDelete handles /admin/delete_product route
func ProductDelete(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	db := models.GetDB()

	if r.Method == "POST" {

		product := &models.Product{}
		id := r.PostFormValue("id")
		if err := db.First(product, id).Error; err != nil || product.ID == 0 {
			err := fmt.Errorf("Изделие под номером: %v не найдено", id)
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
			return
		}

		if err := db.Delete(product).Error; err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		http.Redirect(w, r, "/admin/products", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}
