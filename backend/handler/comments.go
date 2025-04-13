package handler

import (
	"encoding/json"
	"html"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

func CommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/comments" {
		log.Println("url not found", r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	if r.Method != http.MethodPost {
		log.Println("Method not allowed in comment handler", r.Method)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "method not allowed",
		})
		return
	}

	inputid := r.FormValue("id")
	id, err := strconv.Atoi(inputid)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	comment := r.FormValue("comment")
	comment = html.EscapeString(comment)
	if len(strings.TrimSpace(comment)) == 0 {
		log.Println("Empty comment")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "empty comment",
		})
		return
	}

	if comment == "" {
		log.Println("Empty comment")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "empty comment",
		})
		return
	}

	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("Invalid Session")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	user, err := repositories.GetUserBySession(cookie)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	_, err = repositories.InsertRecord(util.DB, "tblPosts", []string{"user_id", "body", "parent_id", "post_title"}, user.ID, comment, id, "comment")
	if err != nil {
		log.Println(err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"error":   "ok",
		"user":    user,
		"session": cookie,
	})
}
