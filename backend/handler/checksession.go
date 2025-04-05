package handler

import (
	"encoding/json"
	"log"
	"net/http"
)

func CheckSession(w http.ResponseWriter, r *http.Request) {
	Mu.Lock()
	defer Mu.Unlock()
	log.Println(SessionStore)
	log.Println("Length of session stote is 0")
	if len(SessionStore) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "no",
		})
		return
	}
	log.Println("Length is not zero")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "ok",
	})
}
