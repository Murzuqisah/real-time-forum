package handler

import (
	"errors"
	"log"
	"time"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"golang.org/x/crypto/bcrypt"
)

var SessionStore = make(map[string]map[string]interface{})

func LoginHandler(password, email string) (models.User, error) {
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
