package util

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

/*
ValidateInput checks for the validity of input values provided via the form.
*/
func ValidateFormFields(userName, email, password, firstname, lastname, gender, age string) error {
	if len(strings.TrimSpace(userName)) == 0 || len(strings.TrimSpace(lastname)) == 0 || len(strings.TrimSpace(firstname)) == 0 {
		return fmt.Errorf("username, lastname and firstname fields cannot be empty")
	}

	for _, v := range userName {
		if (v < '0' || v > '9') && (v < 'a' || v > 'z') && (v < 'A' || v > 'Z') {
			return fmt.Errorf("username must contain only letters and numbers")
		}
	}

	for _, v := range firstname + lastname {
		if (v < 'a' || v > 'z') && (v < 'A' || v > 'Z') {
			return fmt.Errorf("firstname and lastname must contain only letters and numbers")
		}
	}

	check, err := strconv.Atoi(age)

	if check <= 14 || err != nil {
		return fmt.Errorf("user must be 15 years and above")
	}

	if len(strings.TrimSpace(email)) == 0 {
		return fmt.Errorf("email field cannot be empty")
	}

	if len(strings.TrimSpace(password)) == 0 {
		return fmt.Errorf("password field cannot be empty")
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email address format")
	}

	if len(strings.TrimSpace(password)) < 8 {
		return fmt.Errorf("password must contain atleast 8 characters")
	}
	return nil
}
