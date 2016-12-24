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

func init() {
	log.SetFlags(log.Lshortfile)
}

func main() {

	system.Init()
	defer models.GetDB().Close()
	models.ApplyMigrations()

	//Periodic tasks
	//system.CreateXMLSitemap()                         //refresh sitemap now
	gocron.Every(1).Day().Do(system.CreateXMLSitemap) //refresh daily
	gocron.Start()

	//gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.SetHTMLTemplate(system.GetTmpl())
	store := sessions.NewCookieStore([]byte(system.GetConfig().CsrfSecret))
	router.Use(sessions.Sessions("gin-session", store))

	router.StaticFS("/public", http.Dir("public"))
	router.GET("/", controllers.Home)
	router.GET("/signin", controllers.SignInGet)
	router.POST("/signin", controllers.SignInPost)
	router.GET("/signup", controllers.SignUpGet)
	if system.GetConfig().SignupEnabled {
		router.POST("/signup", controllers.SignUpPost)
	}
	router.GET("/logout", controllers.Logout)

	router.GET("/page/:idslug", controllers.PageGet)
	router.GET("/product/:idslug", controllers.ProductGet)
	router.GET("/category/:idslug", controllers.CategoryGet)

	router.Use(system.Authenticated())
	{
		router.GET("/admin", controllers.AdminGet)
		api := router.Group("/api")
		{
			api.POST("/upload", controllers.Upload)

			api.GET("/pages", controllers.ApiPagesGet)
			api.GET("/pages/:id", controllers.ApiPageGet)
			api.POST("/pages", controllers.ApiPageCreate)
			api.PUT("/pages/:id", controllers.ApiPageUpdate)
			api.DELETE("/pages/:id", controllers.ApiPageDelete)

			api.GET("/categories", controllers.ApiCategoriesGet)
			api.GET("/categories/:id", controllers.ApiCategoryGet)
			api.POST("/categories", controllers.ApiCategoryCreate)
			api.PUT("/categories/:id", controllers.ApiCategoryUpdate)
			api.DELETE("/categories/:id", controllers.ApiCategoryDelete)

			api.GET("/products", controllers.ApiProductsGet)
			api.GET("/products/:id", controllers.ApiProductGet)
			api.POST("/products", controllers.ApiProductCreate)
			api.PUT("/products/:id", controllers.ApiProductUpdate)
			api.DELETE("/products/:id", controllers.ApiProductDelete)

			api.GET("/images/:id", controllers.ApiImageGet)
			api.POST("/images", controllers.ApiImageCreate)
			api.DELETE("/images/:id", controllers.ApiImageDelete)

			api.GET("/users", controllers.ApiUsersGet)
			api.GET("/users/:id", controllers.ApiUserGet)
			api.POST("/users", controllers.ApiUserCreate)
			api.PUT("/users/:id", controllers.ApiUserUpdate)
			api.DELETE("/users/:id", controllers.ApiUserDelete)
			api.POST("/logout", controllers.ApiLogout)
		}
	}
	log.Fatal(router.Run(":8030"))
}
