package controllers

import (
	"net/http"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/system"
)

//Dashboard handles GET /admin route
func Dashboard(w http.ResponseWriter, r *http.Request) {
	tmpl := system.GetTmpl()
	data := helpers.DefaultData(r)
	data["Title"] = "Панель управления"
	tmpl.Lookup("dashboard/show").Execute(w, data)
}
