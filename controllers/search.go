package controllers

import "net/http"

//Search handles POST /search route
func Search(w http.ResponseWriter, r *http.Request) {
	/*
		tmpl := system.GetTmpl()
		data := helpers.DefaultData(r)
		if r.Method == "POST" {

			query := r.PostFormValue("query")
			//full text search by name & description. Btw you can extend search to multi-table scenario with rankings, etc
			//fts index and SearchArticles assume language is english
			articles, _ := models.SearchArticles(query)
			data["Title"] = fmt.Sprintf("%s %q", "Результаты поиска по запросу", query)
			data["Articles"] = articles
			tmpl.Lookup("search/results").Execute(w, data)

		} else {
			err := fmt.Errorf("Method %q not allowed", r.Method)
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(405)
			tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
		}
	*/
}
