package controllers

import (
	"net/http"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/system"
)

//Home handles GET / route
func Home(w http.ResponseWriter, r *http.Request) {
	tmpl, data := system.GetTmpl(), helpers.DefaultData(r)
	session := helpers.Session(r)
	if r.RequestURI != "/" {
		w.WriteHeader(404)
		tmpl.Lookup("errors/404").Execute(w, nil)
		return
	}
	data["Title"] = "Вечная память приветствует Вас"
	data["Active"] = "/"
	data["Flash"] = session.Flashes()
	data["TitleSuffix"] = ""
	session.Save(r, w)
	tmpl.Lookup("home/show").Execute(w, data)
}
