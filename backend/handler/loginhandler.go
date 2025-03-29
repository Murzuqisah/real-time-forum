package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
	"golang.org/x/crypto/bcrypt"
)

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var (
	SessionStore = make(map[string]int)
	mu           sync.Mutex
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var data LoginData

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		util.ErrorHandler(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	user, session, err := Login(data.Password, data.Email)
	if err != nil {
		util.ErrorHandler(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	// set a secure session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    session,
		Expires:  time.Now().Add(24 * time.Hour),
		Path:     "/",
		HttpOnly: true,
	})

	log.Println(SessionStore)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"error":   "ok",
		"user":    user,
		"session": session,
	})
}

func Login(password, email string) (models.User, string, error) {
	var user models.User
	var err error

	if isValidEmail(email) {
		user, err = repositories.GetUserByEmail(email)
		if err != nil {
			log.Println("Error fetching user", err)
			return user, "", errors.New("user not found")
		}
	} else {
		user, err = repositories.GetUserByName(email)
		if err != nil {
			log.Println("Error fetching user", err)
			return user, "", errors.New("user not found")
		}
	}

	// decrypt password & authorize user
	storedPassword := user.Password

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(password))
	if err != nil {
		log.Printf("Failed to hash: %v", err)
		return user, "", errors.New("wrong password")
	}

	if user.ID != 0 {
		mu.Lock()
		userIDStr := strconv.Itoa(user.ID)
		_, exists := SessionStore[userIDStr]
		mu.Unlock()

		if exists {
			DeleteSession(user.ID)
			err = repositories.DeleteSessionByUser(user.ID)
			if err != nil {
				log.Printf("Failed to delete session token: %v", err)
				return user, "", errors.New("an Unexpected Error Occurred. Try Again Later")
			}
		}
	}

	err = repositories.DeleteSessionByUser(user.ID)
	if err != nil {
		log.Printf("Failed to delete session token: %v", err)
		return user, "", errors.New("an Unexpected Error Occurred. Try Again Later")
	}

	sessionToken := CreateSession(user.ID)

	expiryTime := time.Now().Add(24 * time.Hour)

	err = repositories.StoreSession(user.ID, sessionToken, expiryTime)
	if err != nil {
		log.Printf("Failed to store session token: %v", err)
		return user, "", errors.New("an Unexpected Error Occurred. Try Again Later")
	}
	return user, sessionToken, nil
}
