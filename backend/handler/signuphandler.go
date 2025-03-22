package handler

import (
	"errors"
	"log"
	"reflect"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

func SignupHandler(username, email, password, confirmedPassword string) error {
	var user models.User

	user.Username = username
	user.Email = email
	user.Password = password
	user.ConfirmedPassword = confirmedPassword

	if !reflect.DeepEqual(user.Password, user.ConfirmedPassword) {
		log.Printf("User password %q and confirmed password %q do not match.\n", user.Password, user.ConfirmedPassword)
		return errors.New("password and confirmed password do not match")
	}

	err := util.ValidateFormFields(user.Username, user.Email, user.Password)
	if err != nil {
		log.Printf("Invalid form values from user: %v\n", err)
		return errors.New("invalid values")
	}

	hashed, err := util.PasswordEncrypt([]byte(user.Password), 10)
	if err != nil {
		log.Printf("Failed encrypting password: %v\n", err)
		return errors.New("an unexpected error occurred. try again later")
	}

	_, err = repositories.InsertRecord(util.DB, "tblUsers", []string{"username", "email", "user_password"}, user.Username, user.Email, string(hashed))
	if err != nil {
		log.Println("Error adding user:", err)
		return errors.New("an unexpected error occurred. try again later")
	}
	log.Println("user added succesfully")
	return nil
}
