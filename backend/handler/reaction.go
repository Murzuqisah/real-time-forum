package handler

import (
	"errors"
	"log"
	"strconv"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

func ReactionHandler(userid, postid, reactionType string) error {
	postID, _ := strconv.Atoi(postid)
	userId, _ := strconv.Atoi(userid)

	check, reaction := repositories.CheckReactions(util.DB, userId, postID)

	if !check {
		_, err := repositories.InsertRecord(util.DB, "tblReactions", []string{"user_id", "post_id", "reaction"}, userId, postID, reactionType)
		if err != nil {
			log.Println("Failed to insert record:", err)
			return errors.New("an unexpected error occurred. try again later")
		}
		return nil
	}

	if reactionType == reaction {
		err := repositories.UpdateReactionStatus(util.DB, userId, postID)
		if err != nil {
			log.Println("Failed to update reaction status:", err)
			return errors.New("an unexpected error occurred. try again later")
		}
		return nil
	} else {
		err := repositories.UpdateReaction(util.DB, reactionType, userId, postID)
		if err != nil {
			log.Println("Failed to update reaction:", err)
			return errors.New("an unexpected error occurred. try again later")
		}
	}
	return nil
}
