package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"text/template"
	"time"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
	"golang.org/x/crypto/bcrypt"
)

var SessionStore = make(map[string]map[string]interface{})

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	var err error
	if r.URL.Path != "/sign-in" {
		util.ErrorHandler(w, "Page does not exist", http.StatusNotFound)
		return
	}

	if r.Method == http.MethodPost {
		email := r.FormValue("email")
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
		response := Response{Success: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		http.Redirect(w, r, "/home", http.StatusSeeOther)
		return
	} else if r.Method == http.MethodGet {
		tmpl, err := template.ParseFiles("frontend/templates/index.html")
		if err != nil {
			log.Println("Error parsing sign in template:", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}

		tmpl.Execute(w, nil)

	} else {
		log.Println("Method not allowed", r.Method)
		util.ErrorHandler(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
}
