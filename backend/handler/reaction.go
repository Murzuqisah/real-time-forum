package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

type Reaction struct {
	PostId       int    `json:"postid"`
	ReactionType string `json:"reaction"`
}

func ReactionHandler(w http.ResponseWriter, r *http.Request) {
	var msg Reaction

	err := json.NewDecoder((r.Body)).Decode((&msg))
	if err != nil {
		log.Println("failed to decode", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	if err != nil {
		log.Println("failed to change post id to int", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("failed to get cookie", err)
		log.Println("Invalid Session")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	user, err := repositories.GetUserBySession(cookie)
	if err != nil {
		log.Println("failed to get user", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	check, reaction := repositories.CheckReactions(util.DB, user.ID, msg.PostId)

	if !check {
		_, err := repositories.InsertRecord(util.DB, "tblReactions", []string{"user_id", "post_id", "reaction"}, user.ID, msg.PostId, msg.ReactionType)
		if err != nil {
			log.Println("Failed to insert record:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}
		SendOK(w,msg)
		return
	}

	if msg.ReactionType == reaction {
		err := repositories.UpdateReactionStatus(util.DB, user.ID, msg.PostId)
		if err != nil {
			log.Println("Failed to update reaction status:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}
		SendOK(w,msg)
		return
	} else {
		err := repositories.UpdateReaction(util.DB, msg.ReactionType, user.ID, msg.PostId)
		if err != nil {
			log.Println("Failed to update reaction:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}
	}
	SendOK(w,msg)
}

func SendOK(w http.ResponseWriter, msg Reaction) {
	post, err := repositories.GetPost(msg.PostId)
	if err != nil {
		log.Println("Failed to get post:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}
	details, err := PostDetails([]models.Post{post})
	if err != nil {
		log.Println("Failed to get post details:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}
	post = details[0]
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"error": "ok",
		"item":  post,
	})
}
