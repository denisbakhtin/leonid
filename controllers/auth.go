package controllers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
)

//SignIn handles /signin route
func SignIn(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()

	if r.Method == "GET" {

		data["Title"] = "Вход в систему"
		data["Active"] = "signin"
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("auth/signin").Execute(w, data)

	} else if r.Method == "POST" {

		user := &models.User{
			Email:    r.PostFormValue("email"),
			Password: r.PostFormValue("password"),
		}
		if err := user.HashPassword(); err != nil {
			session.AddFlash("Error whilst signing user in.")
			session.Save(r, w)
			log.Printf("ERROR: can't sign user in: %v", err)
			http.Redirect(w, r, "/signup", 303)
			return
		}
		//check existence
		userDB := &models.User{}
		db.Where(user).First(userDB)
		if userDB.ID == 0 {
			log.Printf("ERROR: Login failed, IP: %s, Email: %s\n", r.RemoteAddr, user.Email)
			session.AddFlash("Email or password incorrect")
			session.Save(r, w)
			http.Redirect(w, r, "/signin", 303)
			return
		}

		session.Values["user_id"] = userDB.ID
		session.Save(r, w)
		http.Redirect(w, r, "/", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//SignUp handles /signup route
func SignUp(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	session := helpers.Session(r)
	data := helpers.DefaultData(r)
	db := models.GetDB()

	if r.Method == "GET" {

		data["Title"] = "Регистрация в системе"
		data["Active"] = "signup"
		data["Flash"] = session.Flashes()
		session.Save(r, w)
		tmpl.Lookup("auth/signup").Execute(w, data)

	} else if r.Method == "POST" {

		user := &models.User{
			Email:    r.PostFormValue("email"),
			Password: r.PostFormValue("password"),
		}
		//check existence
		userDB := &models.User{}
		db.Where("lower(email) = lower(?)", user.Email).First(userDB)
		if userDB.ID != 0 {
			session.AddFlash("User exists")
			session.Save(r, w)
			http.Redirect(w, r, "/signup", 303)
			return
		}
		//create user
		err := user.HashPassword()
		if err != nil {
			session.AddFlash("Error whilst registering user.")
			session.Save(r, w)
			log.Printf("ERROR: can't register user: %v", err)
			http.Redirect(w, r, "/signup", 303)
			return
		}
		if err := db.Create(user).Error; err != nil {
			session.AddFlash("Error whilst registering user.")
			session.Save(r, w)
			log.Printf("ERROR: can't register user: %v", err)
			http.Redirect(w, r, "/signup", 303)
			return
		}
		session.Values["user_id"] = user.ID
		session.Save(r, w)
		http.Redirect(w, r, "/", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//Logout handles /logout route
func Logout(w http.ResponseWriter, r *http.Request) {
	//any method will do :3
	session := helpers.Session(r)
	delete(session.Values, "user_id")
	session.Save(r, w)
	http.Redirect(w, r, "/", 303)
}
