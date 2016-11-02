package main

import (
	"log"
	"net/http"

	"github.com/claudiu/gocron"
	"github.com/denisbakhtin/leonid/controllers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

//gorilla/csrf middleware
//var CSRF func(http.Handler) http.Handler

func init() {
	log.SetFlags(log.Lshortfile)
}

func main() {

	system.Init()
	defer models.GetDB().Close()
	models.ApplyMigrations()
	//CSRF = csrf.Protect([]byte(system.GetConfig().CsrfSecret), csrf.Secure(system.GetConfig().Ssl), csrf.Path("/"), csrf.Domain(system.GetConfig().Domain))

	//Periodic tasks
	//system.CreateXMLSitemap()                         //refresh sitemap now
	gocron.Every(1).Day().Do(system.CreateXMLSitemap) //refresh daily
	gocron.Start()

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.SetHTMLTemplate(system.GetTmpl())
	store := sessions.NewCookieStore([]byte(system.GetConfig().CsrfSecret))
	router.Use(sessions.Sessions("gin-session", store))
	/*
		http.Handle("/", Default(controllers.Home))
		if system.GetConfig().SignupEnabled {
			http.Handle("/signup", Default(controllers.SignUp))
		}
		http.Handle("/signin", Default(controllers.SignIn))
		http.Handle("/logout", Default(controllers.Logout))

		http.Handle("/pages/", Default(controllers.PageShow))
		http.Handle("/products/", Default(controllers.ProductShow))
		http.Handle("/search", Default(controllers.Search))

		{
			http.Handle("/admin", Restricted(controllers.Dashboard))

			//markdown editor does not support csrf when uploading images, so I have to apply CSRF middleware manually per route, sigh :/
			http.Handle("/admin/ckupload", RestrictedWithoutCSRF(controllers.CkUpload))
		}

		http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public")))) //styles, js, images
	*/

	router.GET("/", controllers.Home)

	router.GET("/signin", controllers.SignInGet)
	router.POST("/signin", controllers.SignInPost)
	router.GET("/signup", controllers.SignUpGet)
	router.POST("/signup", controllers.SignUpPost)
	router.Any("/logout", controllers.Logout)

	router.GET("/page/:slug", controllers.PageGet)
	router.GET("/product/:slug", controllers.ProductGet)

	//TODO: check authentication status
	router.GET("/admin", controllers.AdminGet)
	api := router.Group("/api")
	{
		api.GET("/pages", controllers.ApiPagesGet)
		api.GET("/pages/:id", controllers.ApiPageGet)
		api.PUT("/pages/:id", controllers.ApiPageUpdate)
		api.DELETE("/pages/:id", controllers.ApiPageDelete)
		api.POST("/pages", controllers.ApiPageCreate)

		api.GET("/products", controllers.ApiProductsGet)
		api.GET("/products/:id", controllers.ApiProductGet)
		api.PUT("/products/:id", controllers.ApiProductUpdate)
		api.DELETE("/products/:id", controllers.ApiProductDelete)
		api.POST("/products", controllers.ApiProductCreate)

		api.GET("/users", controllers.ApiUsersGet)
		api.GET("/users/:id", controllers.ApiUserGet)
		api.PUT("/users/:id", controllers.ApiUserUpdate)
		api.DELETE("/users/:id", controllers.ApiUserDelete)
		api.POST("/users", controllers.ApiUserCreate)
		api.POST("/logout", controllers.ApiLogout)
	}
	router.StaticFS("/public", http.Dir("public"))
	router.Run(":8030")
}
