package controllers

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/denisbakhtin/leonid/helpers"
	"github.com/denisbakhtin/leonid/models"
	"github.com/denisbakhtin/leonid/system"
	"gopkg.in/gomail.v2"
)

//CommentIndex handles GET /admin/comments route
func CommentIndex(w http.ResponseWriter, r *http.Request) {
	tmpl := helpers.Template(r)
	data := helpers.DefaultData(r)
	if r.Method == "GET" {

		list, err := models.GetComments()
		if err != nil {
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		data["Title"] = "Вопросы и комментарии"
		data["Active"] = "comments"
		data["List"] = list
		tmpl.Lookup("comments/index").Execute(w, data)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//CommentPublicCreate handles /new_comment route
func CommentPublicCreate(w http.ResponseWriter, r *http.Request) {
	session := helpers.Session(r)
	tmpl := helpers.Template(r)
	if r.Method == "POST" {

		r.ParseForm()
		//simple captcha check
		captcha, err := base64.StdEncoding.DecodeString(r.FormValue("captcha"))
		if err != nil {
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		if string(captcha) != "100.00" {
			w.WriteHeader(400)
			tmpl.Lookup("errors/400").Execute(w, nil)
			return
		}

		comment := &models.Comment{
			ArticleID:   helpers.Atoi64(r.PostFormValue("article_id")),
			AuthorCity:  r.PostFormValue("author_city"),
			AuthorName:  r.PostFormValue("author_name"),
			AuthorEmail: r.PostFormValue("author_email"),
			Content:     r.PostFormValue("content"),
			Published:   false, //comments are published by admin via dashboard
		}

		if err := comment.Insert(); err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(400)
			tmpl.Lookup("errors/400").Execute(w, helpers.ErrorData(err))
			return
		}
		notifyAdminOfComment(r, comment)
		session.AddFlash("Спасибо, что написали нам", "comments")
		session.Save(r, w)
		http.Redirect(w, r, fmt.Sprintf("/articles/%d#comments", comment.ArticleID), 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

//CommentDelete handles /admin/delete_comment route
func CommentDelete(w http.ResponseWriter, r *http.Request) {
	tmpl := helpers.Template(r)

	if r.Method == "POST" {

		comment, err := models.GetComment(r.PostFormValue("id"))
		if err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(404)
			tmpl.Lookup("errors/404").Execute(w, helpers.ErrorData(err))
		}

		if err := comment.Delete(); err != nil {
			log.Printf("ERROR: %s\n", err)
			w.WriteHeader(500)
			tmpl.Lookup("errors/500").Execute(w, helpers.ErrorData(err))
			return
		}
		http.Redirect(w, r, "/admin/comments", 303)

	} else {
		err := fmt.Errorf("Method %q not allowed", r.Method)
		log.Printf("ERROR: %s\n", err)
		w.WriteHeader(405)
		tmpl.Lookup("errors/405").Execute(w, helpers.ErrorData(err))
	}
}

func notifyAdminOfComment(r *http.Request, comment *models.Comment) {
	//closure is needed here, as r may be released by the time func finishes
	tmpl := helpers.Template(r)
	go func() {
		data := map[string]interface{}{
			"Comment": comment,
			//"Token":   createTokenFromID(comment.ID),
		}
		var b bytes.Buffer
		if err := tmpl.Lookup("emails/question").Execute(&b, data); err != nil {
			log.Printf("ERROR: %s\n", err)
			return
		}

		smtp := system.GetConfig().SMTP
		msg := gomail.NewMessage()
		msg.SetHeader("From", smtp.From)
		msg.SetHeader("To", smtp.To)
		if len(comment.AuthorEmail) > 0 {
			msg.SetHeader("Reply-To", comment.AuthorEmail)
		}
		if len(smtp.Cc) > 0 {
			msg.SetHeader("Cc", smtp.Cc)
		}
		msg.SetHeader("Subject", "На сайте опубликован новый комментарий")
		msg.SetBody(
			"text/html",
			b.String(),
		)

		port, _ := strconv.Atoi(smtp.Port)
		dialer := gomail.NewPlainDialer(smtp.SMTP, port, smtp.User, smtp.Password)
		sender, err := dialer.Dial()
		if err != nil {
			log.Printf("ERROR: %s\n", err)
			return
		}
		if err := gomail.Send(sender, msg); err != nil {
			log.Printf("ERROR: %s\n", err)
			return
		}
	}()
}

//notifyClientOfComment sends notification email to comment(question) author
func notifyClientOfComment(r *http.Request, comment *models.Comment) {
	if len(comment.AuthorEmail) == 0 {
		return
	}
	tmpl := helpers.Template(r)
	go func() {
		data := map[string]interface{}{
			"Comment": comment,
		}
		var b bytes.Buffer
		if err := tmpl.Lookup("emails/answer").Execute(&b, data); err != nil {
			log.Printf("ERROR: %s\n", err)
			return
		}

		smtp := system.GetConfig().SMTP
		msg := gomail.NewMessage()
		msg.SetHeader("From", smtp.From)
		msg.SetHeader("To", comment.AuthorEmail)
		msg.SetHeader("Subject", "На ваш комментарий ответили")
		msg.SetBody(
			"text/html",
			b.String(),
		)

		port, _ := strconv.Atoi(smtp.Port)
		dialer := gomail.NewPlainDialer(smtp.SMTP, port, smtp.User, smtp.Password)
		sender, err := dialer.Dial()
		if err != nil {
			log.Printf("ERROR: %s\n", err)
			return
		}
		if err := gomail.Send(sender, msg); err != nil {
			log.Printf("ERROR: %s\n", err)
			return
		}
	}()
}

func postCommentOnSocialWalls(r *http.Request, comment *models.Comment) {
	//TODO
}
