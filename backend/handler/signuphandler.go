package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"reflect"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

type SignUpData struct {
	Username          string `json:"username"`
	Email             string `json:"email"`
	Password          string `json:"password"`
	ConfirmedPassword string `json:"confirmedPassword"`
}

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	var data SignUpData

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	user.Username = data.Username
	user.Email = data.Email
	user.Password = data.Password
	user.ConfirmedPassword = data.ConfirmedPassword

	if !reflect.DeepEqual(user.Password, user.ConfirmedPassword) {
		log.Printf("User password %q and confirmed password %q do not match.\n", user.Password, user.ConfirmedPassword)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "password don't match",
		})
		return
	}

	err = util.ValidateFormFields(user.Username, user.Email, user.Password)
	if err != nil {
		log.Printf("Invalid form values from user: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid input",
		})
		return
	}

	hashed, err := util.PasswordEncrypt([]byte(user.Password), 10)
	if err != nil {
		log.Printf("Failed encrypting password: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	_, err = repositories.InsertRecord(util.DB, "tblUsers", []string{"username", "email", "user_password"}, user.Username, user.Email, string(hashed))
	if err != nil {
		log.Println("Error adding user:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
	}
	log.Println("user added succesfully")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "ok",
	})
}
