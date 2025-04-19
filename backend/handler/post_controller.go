package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"text/template"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

type FetchData struct {
	Categories []string `json:"category"`
	Check      string   `json:"error"`
}

func GetAllPosts(db *sql.DB, tmpl *template.Template, posts []models.Post) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// fetch comments for each post
		for i, post := range posts {
			comments, err := repositories.GetComments(db, post.ID)
			if err != nil {
				log.Printf("Failed to get comments: %v", err)
				util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
				return
			}

			posts[i].Comments = comments
		}

		// Set content type to text/html and serve the index page
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)

		err := tmpl.ExecuteTemplate(w, "index.html", struct {
			Posts []models.Post
		}{Posts: posts})
		if err != nil {
			log.Printf("Failed to render template: %v", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}
	}
}

func GetAllPostsAPI(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		posts, err := repositories.GetPosts(db)
		if err != nil {
			log.Printf("Failed to get posts: %v", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}
		// fetch comments for each post
		for i, post := range posts {
			comments, err := repositories.GetComments(db, post.ID)
			if err != nil {
				log.Printf("Failed to get posts: %v", err)
				util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
				return
			}

			posts[i].Comments = comments
		}

		w.Header().Set("Content-Type", "application/json")

		if err = json.NewEncoder(w).Encode(posts); err != nil {
			log.Printf("Failed to encode posts to JSON: %v", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}
	}
}

// FilterPosts - Handles filtering posts by category or user
func FilterPosts(w http.ResponseWriter, r *http.Request) {
	var data FetchData
	if r.Method == http.MethodGet {
		http.ServeFile(w, r, "frontend/templates/index.html")
		return
	}
	
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Println("failed to decode: ", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	if r.Method != http.MethodPost {
		log.Println("Method not allowed", r.Method)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Method not allowed",
		})
		return
	}

	_, err = getSessionID(r)
	if err != nil {
		log.Println("Invalid Session")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid session",
		})
		return
	}

	categories := data.Categories

	if len(categories) != 0 {
		posts, err := repositories.FilterPostsByCategories(util.DB, categories)
		if err != nil {
			log.Println("error filtering posts:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}
		posts, err = PostDetails(posts)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}

		for i := range posts {
			posts[i].CreatedOn = posts[i].CreatedOn.UTC()
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"error": "ok",
			"posts": posts,
		})
		return
	}

	if data.Check == "none" {
		posts, err := repositories.GetPosts(util.DB)
		if err != nil {
			log.Println("Error fetching posts:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}

		posts, err = PostDetails(posts)
		if err != nil {
			log.Println("Error processing posts:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}

		for i := range posts {
			posts[i].CreatedOn = posts[i].CreatedOn.UTC()
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"error": "ok",
			"posts": posts,
		})
		return

	}

	posts := []models.Post{}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"error": "ok",
		"posts": posts,
	})
}
