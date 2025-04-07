package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jesee-kuya/forum/backend/repositories"
)

func CheckSession(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Session string `json:"session"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Println("Error decoding session data:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "no",
		})
		return
	}

	Mu.Lock()
	_, validSession := SessionStore[data.Session]
	Mu.Unlock()

	if !validSession {
		// Also check the database for the session
		_, err := repositories.ValidateSession(data.Session)
		if err != nil {
			log.Println("Invalid session:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "no",
			})
			return
		}
		// If session is valid in DB but not in memory, add it to memory
		user, err := repositories.GetUserBySession(data.Session)
		if err == nil {
			Mu.Lock()
			SessionStore[data.Session] = user.ID
			Mu.Unlock()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "ok",
	})
}
