package handler

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type RequestData struct {
	ID string `json:"id"`
}

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/home" {
		util.ErrorHandler(w, "Page does not exist", http.StatusNotFound)
		return
	}

	if r.Method != http.MethodGet {
		log.Println("wrong method used", r.Method)
		util.ErrorHandler(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("Invalid Session")
		http.ServeFile(w, r, "./frontend/templates/index.html")
		return
	}
	sessionData, err := getSessionData(cookie)
	if err != nil {
		log.Println("Invalid Session")
		http.ServeFile(w, r, "./frontend/templates/index.html")
		return
	}
	// Fetch user information
	_, err = repositories.GetUserByEmail(sessionData["userEmail"].(string))
	if err != nil {
		log.Printf("Invalid session token: %v", err)
		http.ServeFile(w, r, "./frontend/templates/index.html")
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	defer conn.Close()

	for {
		var msg map[string]string
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			break
		}

		if msg["action"] == "getPosts" {
			posts, err := repositories.GetPosts(util.DB)
			if err != nil {
				conn.WriteJSON(map[string]interface{}{
					"type":    "error",
					"message": "An Unexpected Error Occurred. Try Again Later",
				})
			}

			posts, err = PostDetails(posts)
			if err != nil {
				conn.WriteJSON(map[string]interface{}{
					"type":    "error",
					"message": err.Error(),
				})
			}
			conn.WriteJSON(map[string]interface{}{
				"type":  "posts",
				"posts": posts,
			})
		}

	}
}
