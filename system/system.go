package system

import (
	"fmt"

	"github.com/denisbakhtin/leonid/models"
)

var mode string //application mode: debug, release, test

//Init initializes core system elements (DB, sessions, templates, et al)
func Init() {
	loadConfig()
	createSession()
	loadTemplates()
	connection := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", config.Database.Host, config.Database.User, config.Database.Password, config.Database.Name)
	models.InitDB(connection)
}
