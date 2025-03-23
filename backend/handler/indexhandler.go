package handler

import (
	"encoding/json"
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
		var rawMessage string
		err := websocket.Message.Receive(conn, &rawMessage)
		if err != nil {
			log.Println("WebSocket closed: ", err)
			break
		}

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
		case "restoreState":
			log.Println(msg["state"])
			sendJSON(conn, map[string]interface{}{
				"type":  "restoreState",
				"state": msg["state"],
			})
		case "reaction":
			err := ReactionHandler(msg["userid"], msg["postid"], msg["reaction"])
			if err != nil {
				log.Println("Error adding reaction")
				sendJSON(conn, map[string]interface{}{
					"type":    "error",
					"message": err.Error(),
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
