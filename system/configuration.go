package system

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path"
)

//Config contains application configuration for active application mode
type Config struct {
	Public        string `json:"public"`
	Uploads       string `json:"-"`
	Domain        string `json:"domain"`
	SessionSecret string `json:"session_secret"`
	CsrfSecret    string `json:"csrf_secret"`
	Ssl           bool   `json:"ssl"`
	SignupEnabled bool   `json:"signup_enabled"` //always set to false in release mode (config.json)
	Salt          string `json:"salt"`           //sha salt for generation of review & comment tokens

	Database DatabaseConfig
	SMTP     SMTPConfig
	Oauth    OauthConfig
}

//DatabaseConfig contains database connection info
type DatabaseConfig struct {
	Host     string
	Name     string //database name
	User     string
	Password string
}

//SMTPConfig contains smtp mailer info
type SMTPConfig struct {
	From     string //from email
	To       string //to email
	Cc       string //cc email
	SMTP     string //smtp server address
	Port     string //smtp port
	User     string //smtp user login
	Password string //smtp user password
}

//OauthConfig contains oauth login info
type OauthConfig struct {
	Facebook OauthApp
	Google   OauthApp
	Linkedin OauthApp
	Vk       OauthApp
}

//OauthApp contains oauth application data
type OauthApp struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	RedirectURL  string `json:"redirect_url"`
	Page         string `json:"page"`  //page id, mainly for facebook atm
	Token        string `json:"token"` //page token, mainly for facebook atm. Read http://stackoverflow.com/questions/17197970/facebook-permanent-page-access-token
}

var (
	config *Config
)

//loadConfig unmarshals config for current application mode
func loadConfig() {
	data, err := ioutil.ReadFile("config/config.json")
	if err != nil {
		panic(err)
	}
	config = &Config{}
	err = json.Unmarshal(data, config)
	if err != nil {
		panic(err)
	}
	if !path.IsAbs(config.Public) {
		workingDir, err := os.Getwd()
		if err != nil {
			panic(err)
		}
		config.Public = path.Join(workingDir, config.Public)
	}
	config.Uploads = path.Join(config.Public, "uploads")
}

//GetConfig returns actual config
func GetConfig() *Config {
	return config
}
