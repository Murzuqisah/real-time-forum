package handler

import (
	"errors"
	"log"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

func PostDetails(posts []models.Post) ([]models.Post, error) {
	for i, post := range posts {
		comments, err1 := repositories.GetComments(util.DB, post.ID)
		if err1 != nil {
			log.Println("Failed to get comments:", err1)
			return nil, errors.New("an Unexpected Error Occurred. Try Again Later")
		}

		// Getting comment reactions
		for j, comment := range comments {
			commentLikes, errLikes := repositories.GetReactions(util.DB, comment.ID, "Like")
			if errLikes != nil {
				log.Println("Failed to get likes", errLikes)
				return nil, errors.New("an Unexpected Error Occurred. Try Again Later")
			}

			commentDislikes, errDislikes := repositories.GetReactions(util.DB, comment.ID, "Dislike")
			if errDislikes != nil {
				log.Println("Failed to get dislikes", errDislikes)
				return nil, errors.New("an Unexpected Error Occurred. Try Again Later")
			}

			comments[j].Likes = len(commentLikes)
			comments[j].Dislikes = len(commentDislikes)
		}

		categories, err3 := repositories.GetCategories(util.DB, post.ID)
		if err3 != nil {
			log.Println("Failed to get categories", err3)
			return nil, errors.New("an Unexpected Error Occurred. Try Again Later")
		}
		likes, err4 := repositories.GetReactions(util.DB, post.ID, "like")
		if err4 != nil {
			log.Println("Failed to get likes", err4)
			return nil, errors.New("an Unexpected Error Occurred. Try Again Later")
		}
		dislikes, err := repositories.GetReactions(util.DB, post.ID, "Dislike")
		if err != nil {
			log.Printf("Failed to get dislikes: %v", err)
			return nil, errors.New("an Unexpected Error Occurred. Try Again Later")
		}

		for i := range comments {
			comments[i].CreatedOn = comments[i].CreatedOn.UTC()
		}

		posts[i].Comments = comments
		posts[i].CommentCount = len(comments)
		posts[i].Categories = categories
		posts[i].Likes = len(likes)
		posts[i].Dislikes = len(dislikes)
	}
	return posts, nil
}
