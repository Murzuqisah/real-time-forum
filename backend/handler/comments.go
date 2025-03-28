package handler

import (
	"html"
	"log"
	"net/http"
	"strings"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

func CommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/comments" {
		log.Println("url not found", r.URL.Path)
		util.ErrorHandler(w, "Page does not exist", http.StatusNotFound)
		return
	}

	if r.Method != http.MethodPost {
		log.Println("Method not allowed in comment handler", r.Method)
		util.ErrorHandler(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("Invalid Session")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	sessionData, err := getSessionData(cookie)
	if err != nil {
		log.Println("Invalid Session")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	id := r.FormValue("id")
	userId := sessionData["userId"].(int)
	comment := r.FormValue("comment")
	comment = html.EscapeString(comment)
	if len(strings.TrimSpace(comment)) == 0 {
		log.Println("Empty comment")
		util.ErrorHandler(w, "Bad Request", http.StatusBadRequest)
		http.Redirect(w, r, "/home", http.StatusSeeOther)
		return
	}

	if comment == "" {
		log.Println("Empty comment")
		http.Redirect(w, r, "/home", http.StatusSeeOther)
		return
	}

	repositories.InsertRecord(util.DB, "tblPosts", []string{"user_id", "body", "parent_id", "post_title"}, userId, comment, id, "comment")
	http.Redirect(w, r, "/home", http.StatusSeeOther)
}
