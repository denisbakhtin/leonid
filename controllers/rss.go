package controllers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
	"github.com/gorilla/feeds"
)

//RssXML handles GET /rss route
func RssXML(w http.ResponseWriter, r *http.Request) {
	tmpl := helpers.Template(r)
	T := helpers.T(r)
	if r.Method == "GET" {

		now := time.Now()
		domain := system.GetConfig().Domain
		feed := &feeds.Feed{
			Title:       T("site_name"),
			Link:        &feeds.Link{Href: domain},
			Description: T("blog_description"),
			Author:      &feeds.Author{Name: "Blog Author"},
			Created:     now,
			Copyright:   fmt.Sprintf("© %s", T("site_name")),
		}

		feed.Items = make([]*feeds.Item, 0)
		articles, err := models.GetPublishedArticles()
		if err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		for i := range articles {
			feed.Items = append(feed.Items, &feeds.Item{
				Id:          fmt.Sprintf("%s/articles/%d", domain, articles[i].ID),
				Title:       articles[i].Name,
				Link:        &feeds.Link{Href: fmt.Sprintf("%s/articles/%d", domain, articles[i].ID)},
				Description: string(articles[i].Excerpt),
				Created:     now,
			})
		}

		rss, err := feed.ToRss()
		if err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		fmt.Fprintln(w, rss)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}
