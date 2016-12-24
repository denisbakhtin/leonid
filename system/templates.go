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
		"truncate":      Truncate,
		"eqRI":          EqRI,
		"slides":        Slides,
		"signupEnabled": SignupEnabled,
		"currentYear":   CurrentYear,
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

//CurrentYear returns current year
func CurrentYear() string {
	return fmt.Sprintf("%d", time.Now().Local().Year())
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

//Slides returns array of slides for home carousel
func Slides() []string {
	return []string{
		"/public/uploads/memorial_1920x800.jpg",
		"/public/uploads/stol_1920x800.jpg",
		"/public/uploads/podokonnik_1920x800.jpg",
		"/public/uploads/stol2_1920x800.jpg",
		"/public/uploads/stol3_1920x800.jpg",
	}
}

//SignupEnabled checks if signup is enabled by config.json
func SignupEnabled() bool {
	return GetConfig().SignupEnabled
}

//MainMenu returns the list of main menu items
func MainMenu() []MenuItem {
	//about, _ := models.GetPage(4)
	//cure, _ := models.GetPage(6)
	//contacts, _ := models.GetPage(7)
	menu := []MenuItem{
		MenuItem{
			URL:   "/",
			Title: "Главная",
		},
		MenuItem{
			URL:   "/page/1-o-kompanii",
			Title: "О компании",
		},
		MenuItem{
			URL:   "/categories",
			Title: "Каталог",
		},
		MenuItem{
			URL:   "/page/3-prais-list",
			Title: "Прайс лист",
		},
		MenuItem{
			URL:   "/page/2-kontakty",
			Title: "Контакты",
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
