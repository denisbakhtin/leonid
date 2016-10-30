package system

//go:generate rice embed-go

import (
	"html/template"
	"log"
	"os"
	"strings"

	"github.com/GeertJohan/go.rice"
	"github.com/denisbakhtin/leonid/helpers"
)

var tmpl *template.Template

func loadTemplates() {
	box := rice.MustFindBox("../views")
	tmpl = template.New("").Funcs(template.FuncMap{
		"isActive":       helpers.IsActive,
		"stringInSlice":  helpers.StringInSlice,
		"dateTime":       helpers.DateTime,
		"date":           helpers.Date,
		"recentArticles": helpers.RecentArticles,
		"mainMenu":       helpers.MainMenu,
		"scrollMenu":     helpers.ScrollMenu,
		"oddEvenClass":   helpers.OddEvenClass,
		"truncate":       helpers.Truncate,
		"sellingPreface": helpers.SellingPreface,
		"promoTill":      helpers.PromoTill,
		"eqRI":           helpers.EqRI,
	})

	fn := func(path string, f os.FileInfo, err error) error {
		if f.IsDir() != true && strings.HasSuffix(f.Name(), ".html") {
			var err error
			tmpl, err = tmpl.Parse(box.MustString(path))
			if err != nil {
				return err
			}
		}
		return nil
	}

	err := box.Walk("", fn)
	if err != nil {
		log.Panic(err)
	}
}
