package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"golang.org/x/crypto/bcrypt"
)

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var SessionStore = make(map[string]map[string]interface{})

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var data LoginData

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	user, err := Login(data.Password, data.Email)
	if err != nil {
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
		"error": "ok",
		"user":  user,
	})
}

func Login(password, email string) (models.User, error) {
	var user models.User
	var err error

	if isValidEmail(email) {
		user, err = repositories.GetUserByEmail(email)
		if err != nil {
			log.Println("Error fetching user", err)
			return user, errors.New("user not found")
		}
	} else {
		user, err = repositories.GetUserByName(email)
		if err != nil {
			log.Println("Error fetching user", err)
			return user, errors.New("user not found")
		}
	}

	// decrypt password & authorize user
	storedPassword := user.Password

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(password))
	if err != nil {
		log.Printf("Failed to hash: %v", err)
		return user, errors.New("wrong password")
	}

	sessionToken := CreateSession()

	if user.ID != 0 {
		DeleteSession(user.ID)
	}
	err = repositories.DeleteSessionByUser(user.ID)
	if err != nil {
		log.Printf("Failed to delete session token: %v", err)
		return user, errors.New("an Unexpected Error Occurred. Try Again Later")
	}

	SetSessionData(sessionToken, "userId", user.ID)
	SetSessionData(sessionToken, "userEmail", user.Email)
	expiryTime := time.Now().Add(24 * time.Hour)

	err = repositories.StoreSession(user.ID, sessionToken, expiryTime)
	if err != nil {
		log.Printf("Failed to store session token: %v", err)
		return user, errors.New("an Unexpected Error Occurred. Try Again Later")
	}
	return user, nil
}
