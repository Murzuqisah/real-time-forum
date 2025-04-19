package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/jesee-kuya/forum/backend/repositories"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		http.ServeFile(w, r, "frontend/templates/index.html")
		return
	}
	
	if r.Method != http.MethodPost {
		log.Println("method not allowed")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("Invalid Session:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid session",
		})
		return
	}

	err = repositories.DeleteSession(cookie)
	if err != nil {
		log.Println("error deleting session:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	mu.Lock()
	delete(SessionStore, cookie)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}
