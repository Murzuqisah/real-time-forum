package handler

import (
	"log"
	"net/http"
	"text/template"

	"github.com/jesee-kuya/forum/backend/util"
)

func Render(w http.ResponseWriter, r *http.Request) {
	// Parse and execute the template
	tmpl, err := template.ParseFiles("frontend/templates/index.html")
	if err != nil {
		log.Printf("Failed to load index template: %v", err)
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}
