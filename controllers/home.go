package controllers

import (
	"net/http"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
)

//Home handles GET / route
func Home(w http.ResponseWriter, r *http.Request) {
	tmpl, data := helpers.Template(r), helpers.DefaultData(r)
	session := helpers.Session(r)
	T := helpers.T(r)
	if r.RequestURI != "/" {
		w.WriteHeader(404)
		tmpl.Lookup("errors/404").Execute(w, nil)
		return
	}
	data["Title"] = T("site_name_full")
	data["Page"], _ = models.GetPage(1)
	data["Active"] = "/"
	data["Articles"], _ = models.GetRecentArticles()
	data["Flash"] = session.Flashes()
	data["TitleSuffix"] = ""
	session.Save(r, w)
	tmpl.Lookup("home/show").Execute(w, data)
}