package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
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
	Mu           sync.Mutex
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		http.ServeFile(w, r, "frontend/templates/index.html")
		return
	}

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

	user, session, err := Login(data.Password, data.Email)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": err.Error(),
		})
		return
	}

	SetSessionCookie(w, session)

	log.Println(SessionStore)

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
		"error":   "ok",
		"user":    user,
		"session": session,
		"posts":   posts,
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
		DeleteSession(user.ID)
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
