package system

import "github.com/gorilla/sessions"

var (
	store *sessions.FilesystemStore
	//store *sessions.CookieStore
)

func createSession() {
	/*
		store = sessions.NewFilesystemStore("", []byte(config.SessionSecret))
		//store = sessions.NewCookieStore([]byte(config.SessionSecret))
		store.Options = &sessions.Options{Domain: config.Domain, Path: "/", Secure: config.Ssl, HttpOnly: true, MaxAge: 7 * 86400}
	*/
}

//AuthMiddleware inits common request data (active user, et al). Must be preceded by SessionMiddleware
/*
func AuthMiddleware(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		//set active user
		session := context.Get(r, "session").(*sessions.Session)
		if uID, ok := session.Values["user_id"]; ok {
			user := &models.User{}
			models.GetDB().Find(user, uID)
			if user.ID != 0 {
				context.Set(r, "user", user)
			}
		}
		//enable signup link
		if config.SignupEnabled {
			context.Set(r, "signup_enabled", true)
		}

		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}
*/
