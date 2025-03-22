package handler

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
	"golang.org/x/net/websocket"
)

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func HandleWebsocket(ws *websocket.Conn) {
	HandleConnection(ws)
}

func HandleConnection(conn *websocket.Conn) {
	for {
		// Receive raw JSON as a string
		var rawMessage string
		err := websocket.Message.Receive(conn, &rawMessage)
		if err != nil {
			log.Println("WebSocket closed: ", err)
			break
		}

		// Parse JSON into a map
		var msg map[string]string
		if err := json.Unmarshal([]byte(rawMessage), &msg); err != nil {
			log.Println("Error decoding message:", err)
			sendJSON(conn, map[string]interface{}{
				"type":    "error",
				"message": "Invalid JSON format",
			})
			continue
		}

		log.Printf("Received Message: %v", msg)

		// Handle different message types
		switch msg["type"] {
		case "getposts":
			posts, err := repositories.GetPosts(util.DB)
			if err != nil {
				log.Println("Error fetching posts:", err)
				sendJSON(conn, map[string]interface{}{
					"type":    "error",
					"message": "An unexpected error occurred. Try again later.",
				})
				break
			}

			posts, err = PostDetails(posts)
			if err != nil {
				log.Println("Error processing posts:", err)
				sendJSON(conn, map[string]interface{}{
					"type":    "error",
					"message": err.Error(),
				})
				break
			}

			sendJSON(conn, map[string]interface{}{
				"type":  "posts",
				"posts": posts,
			})

		case "signIn":
			password, email := msg["password"], msg["email"]
			user, err := LoginHandler(password, email)
			if err != nil {
				log.Println("Login error:", err)
				sendJSON(conn, map[string]interface{}{
					"type": "error",
					"msg":  fmt.Sprintf("%v", err),
				})
			} else {
				sendJSON(conn, map[string]interface{}{
					"type":  "signIn",
					"user":  user,
					"error": fmt.Sprintf("%v", err),
				})
			}
		default:
			log.Println("Unknown message type:", msg["type"])
			sendJSON(conn, map[string]interface{}{
				"type":    "error",
				"message": "Invalid message type",
			})
		}
	}
}

// Helper function to send JSON response
func sendJSON(conn *websocket.Conn, data interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Println("Error encoding JSON:", err)
		return
	}
	err = websocket.Message.Send(conn, string(jsonData))
	if err != nil {
		log.Println("Error sending message:", err)
	}
}
