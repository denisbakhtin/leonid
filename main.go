package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/claudiu/gocron"
	"github.com/denisbakhtin/leonid/controllers"
	"github.com/denisbakhtin/leonid/system"
	"github.com/gorilla/csrf"
)

//gorilla/csrf middleware
var CSRF func(http.Handler) http.Handler

func init() {
	log.SetFlags(log.Lshortfile)
}

func main() {
	migrate := flag.String("migrate", "up", "Run DB migrations: up, down, redo, skip, and then os.Exit(0)")
	mode := flag.String("mode", "debug", "Application mode: debug, release, test")
	flag.Parse()

	system.SetMode(mode)
	system.Init()
	system.RunMigrations(migrate)
	CSRF = csrf.Protect([]byte(system.GetConfig().CsrfSecret), csrf.Secure(system.GetConfig().Ssl), csrf.Path("/"), csrf.Domain(system.GetConfig().Domain))

	//Periodic tasks
	//system.CreateXMLSitemap()                         //refresh sitemap now
	gocron.Every(1).Day().Do(system.CreateXMLSitemap) //refresh daily
	gocron.Start()

	http.Handle("/", Default(controllers.Home))
	if system.GetConfig().SignupEnabled {
		http.Handle("/signup", Default(controllers.SignUp))
	}
	http.Handle("/signin", Default(controllers.SignIn))
	http.Handle("/logout", Default(controllers.Logout))

	http.Handle("/pages/", Default(controllers.PageShow))
	http.Handle("/articles", Default(controllers.ArticlePublicIndex))
	http.Handle("/articles/", Default(controllers.ArticleShow))
	http.Handle("/rss", Default(controllers.RssXML))
	http.Handle("/search", Default(controllers.Search))
	http.Handle("/new_request", Default(controllers.RequestCreate))
	http.Handle("/new_comment", Default(controllers.CommentPublicCreate))

	{
		http.Handle("/admin", Restricted(controllers.Dashboard))

		//markdown editor does not support csrf when uploading images, so I have to apply CSRF middleware manually per route, sigh :/
		http.Handle("/admin/ckupload", RestrictedWithoutCSRF(controllers.CkUpload))
	}

	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public")))) //styles, js, images

	log.Fatal(http.ListenAndServe(":8030", http.DefaultServeMux))
}

//Default executes default middleware chain for a HandlerFunc
func Default(fn func(http.ResponseWriter, *http.Request)) http.Handler {
	return CSRF(
		system.SessionMiddleware(
			system.TemplateMiddleware(
				system.DataMiddleware(
					http.HandlerFunc(fn),
				),
			),
		),
	)
}

//Restricted executes default + restriced middleware chain for a HandlerFunc
func Restricted(fn func(http.ResponseWriter, *http.Request)) http.Handler {
	return CSRF(
		RestrictedWithoutCSRF(fn),
	)
}

//RestrictedWithoutCSRF executes default + restriced middleware chain without CSRF middleware
func RestrictedWithoutCSRF(fn func(http.ResponseWriter, *http.Request)) http.Handler {
	return system.SessionMiddleware(
		system.TemplateMiddleware(
			system.DataMiddleware(
				system.RestrictedMiddleware(http.HandlerFunc(fn)),
			),
		),
	)
}
