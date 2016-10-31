package system

import (
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/denisbakhtin/leonid/helpers"
)

var tmpl *template.Template

func loadTemplates() {
	tmpl = template.New("").Funcs(template.FuncMap{
		"isActive":       helpers.IsActive,
		"stringInSlice":  helpers.StringInSlice,
		"dateTime":       helpers.DateTime,
		"date":           helpers.Date,
		"recentArticles": helpers.RecentArticles,
		"mainMenu":       helpers.MainMenu,
		"oddEvenClass":   helpers.OddEvenClass,
		"truncate":       helpers.Truncate,
		"eqRI":           helpers.EqRI,
	})

	fn := func(path string, f os.FileInfo, err error) error {
		if f.IsDir() != true && strings.HasSuffix(f.Name(), ".html") {
			var err error
			tmpl, err = tmpl.ParseFiles(path)
			if err != nil {
				return err
			}
		}
		return nil
	}

	err := filepath.Walk("views", fn)
	if err != nil {
		log.Panic(err)
	}
}
