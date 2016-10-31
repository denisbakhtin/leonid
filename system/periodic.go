package system

//CreateXMLSitemap creates xml sitemap for search engines, and saves in public/sitemap folder
func CreateXMLSitemap() {
	/*
		log.Printf("INFO: Starting XML sitemap generation\n")
		folder := path.Join(GetConfig().Public, "sitemap")
		domain := "http://www." + GetConfig().Domain
		now := time.Now()
		items := make([]sitemap.Item, 0, 500)

		//Home page
		items = append(items, sitemap.Item{
			Loc:        fmt.Sprintf("%s", domain),
			LastMod:    now,
			Changefreq: "daily",
			Priority:   1,
		})

			//Articles
			items = append(items, sitemap.Item{
				Loc:        fmt.Sprintf("%s%s", domain, "/articles"),
				LastMod:    now,
				Changefreq: "monthly",
				Priority:   0.9,
			})

			articles, err := models.GetPublishedArticles()
			if err != nil {
				log.Printf("ERROR: %s\n", err)
				return
			}
			for i := range articles {
				items = append(items, sitemap.Item{
					Loc:        fmt.Sprintf("%s%s", domain, articles[i].URL()),
					LastMod:    articles[i].UpdatedAt,
					Changefreq: "weekly",
					Priority:   0.9,
				})
			}

			//Static pages
			pages, err := models.GetPublishedPages()
			if err != nil {
				log.Printf("ERROR: %s\n", err)
				return
			}
			for i := range pages {
				items = append(items, sitemap.Item{
					Loc:        fmt.Sprintf("%s%s", domain, pages[i].URL()),
					LastMod:    pages[i].UpdatedAt,
					Changefreq: "monthly",
					Priority:   0.8,
				})
			}

			if err := sitemap.SiteMap(path.Join(folder, "sitemap1.xml.gz"), items); err != nil {
				log.Printf("ERROR: %s\n", err)
				return
			}
			if err := sitemap.SiteMapIndex(folder, "sitemap_index.xml", domain+"/public/sitemap/"); err != nil {
				log.Printf("ERROR: %s\n", err)
				return
			}
			log.Printf("INFO: XML sitemap has been generated in %s\n", folder)
	*/
}
