package handler

import (
	"encoding/json"
	"net/http"

	"github.com/jesee-kuya/forum/backend/repositories"
)

func CheckSession(w http.ResponseWriter, r *http.Request) {
	var sessionData struct {
		Session string `json:"session"`
	}

	err := json.NewDecoder(r.Body).Decode(&sessionData)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid request",
		})
		return
	}

	// Check if session exists and is valid
	userId, err := repositories.ValidateSession(sessionData.Session)
	if err != nil || userId == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "no",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "ok",
	})
}
