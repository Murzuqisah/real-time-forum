package handler

import (
	"errors"
	"html"
	"log"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

func Comment(userId, id int, comment string) error {
	_, err := repositories.InsertRecord(util.DB, "tblPosts", []string{"user_id", "body", "parent_id", "post_title"}, userId, html.EscapeString(comment), id, "comment")
	if err != nil {
		log.Println("Failed to insert record:", err)
		return errors.New("an unexpected error occurred. try again later")
	}
	return nil
}
