package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
	"golang.org/x/crypto/bcrypt"
)

type SignInData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var SessionStore = make(map[string]map[string]interface{})

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	var signIn SignInData
	if r.URL.Path != "/sign-in" {
		util.ErrorHandler(w, "Page does not exist", http.StatusNotFound)
		return
	}

	if r.Method == http.MethodPost {
		err := json.NewDecoder(r.Body).Decode(&signIn)
		if err != nil {
			log.Printf("Failed decoding request body: %v\n", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}

		email := signIn.Email

		if isValidEmail(email) {
			user, err = repositories.GetUserByEmail(email)
			if err != nil {
				log.Println("Error fetching user", err)
				util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
				return
			}
		} else {
			user, err = repositories.GetUserByName(email)
			if err != nil {
				log.Println("Error fetching user", err)
				util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
				return
			}
		}

		// decrypt password & authorize user
		storedPassword := user.Password

		err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(r.FormValue("password")))
		if err != nil {
			log.Printf("Failed to hash: %v", err)
			w.Header().Set("Content-Type", "application/json")
			response := Response{Success: false}
			json.NewEncoder(w).Encode(response)
			return
		}

		sessionToken := CreateSession()

		if user.ID != 0 {
			DeleteSession(user.ID)
		}
		err = repositories.DeleteSessionByUser(user.ID)
		if err != nil {
			log.Printf("Failed to delete session token: %v", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}

		EnableCors(w)

		SetSessionCookie(w, sessionToken)
		SetSessionData(sessionToken, "userId", user.ID)
		SetSessionData(sessionToken, "userEmail", user.Email)
		expiryTime := time.Now().Add(24 * time.Hour)

		err = repositories.StoreSession(user.ID, sessionToken, expiryTime)
		if err != nil {
			log.Printf("Failed to store session token: %v", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"redirect": "/home",
		})
		return
	} else if r.Method == http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"redirect": "/sign-in",
		})
	}else {
		log.Println("Method not allowed", r.Method)
		util.ErrorHandler(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
}
