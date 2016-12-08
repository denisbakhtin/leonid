package system

import (
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

//MenuItem represents main menu item
type MenuItem struct {
	URL      string
	Title    string //will be passed to T i18n function
	CssClass string
	IsActive bool
}

var tmpl *template.Template

//GetTmpl return parsed templates
func GetTmpl() *template.Template {
	return tmpl
}

func loadTemplates() {
	tmpl = template.New("").Funcs(template.FuncMap{
		"isActive":      IsActive,
		"stringInSlice": StringInSlice,
		"dateTime":      DateTime,
		"date":          Date,
		"mainMenu":      MainMenu,
		"oddEvenClass":  OddEvenClass,
		"truncate":      Truncate,
		"eqRI":          EqRI,
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

//IsActive checks uri against currently active (uri, or nil) and returns "active" if they are equal
func IsActive(active interface{}, uri string) string {
	if s, ok := active.(string); ok {
		if s == uri {
			return "active"
		}
	}
	return ""
}

//DateTime prints timestamp in human format
func DateTime(t time.Time) string {
	return fmt.Sprintf("%d-%02d-%02d %02d:%02d:%02d", t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second())
}

//Date prints date part of timestamp
func Date(t time.Time) string {
	return fmt.Sprintf("%d-%02d-%02d", t.Year(), t.Month(), t.Day())
}

//StringInSlice returns true if value is in list slice
func StringInSlice(value string, list []string) bool {
	for i := range list {
		if value == list[i] {
			return true
		}
	}
	return false
}

//OddEvenClass returns odd or even class depending on the index
func OddEvenClass(index int) string {
	//range indexes start with zero %)
	if (index+1)%2 == 1 {
		return "odd"
	}
	return "even"
}

//MainMenu returns the list of main menu items
func MainMenu() []MenuItem {
	//about, _ := models.GetPage(4)
	//cure, _ := models.GetPage(6)
	//contacts, _ := models.GetPage(7)
	menu := []MenuItem{
		MenuItem{
			URL:   "pages/about",
			Title: "О компании",
		},
		MenuItem{
			URL:   "/categories",
			Title: "Каталог",
		},
		MenuItem{
			URL:   "/pages/pricelist",
			Title: "Прайс-лист",
		},
		MenuItem{
			URL:   "/pages/job",
			Title: "Вакансии",
		},
	}
	return menu
}

//Truncate truncates string to n chars
func Truncate(s string, n int) string {
	runes := []rune(s)
	if len(runes) > n {
		return string(runes[:n]) + "..."
	}
	return s
}

//EqRI compares *int64 to int64
func EqRI(r *int64, i int64) bool {
	if r == nil {
		if i == 0 {
			return true
		}
		return false
	}
	return (*r == i)
}

func mon(m time.Month) string {
	switch m {
	case 1:
		return "января"
	case 2:
		return "февраля"
	case 3:
		return "марта"
	case 4:
		return "апреля"
	case 5:
		return "мая"
	case 6:
		return "июня"
	case 7:
		return "июля"
	case 8:
		return "августа"
	case 9:
		return "сентября"
	case 10:
		return "октября"
	case 11:
		return "ноября"
	case 12:
		return "декабря"
	default:
		return ""
	}
}
