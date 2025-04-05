package handler

import (
	"encoding/json"
	"log"
	"strconv"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
	"golang.org/x/net/html"
	"golang.org/x/net/websocket"
)

var onlineUsers = make(map[string]*websocket.Conn)

func HandleWebsocket(ws *websocket.Conn) {
	defer ws.Close()
	HandleConnection(ws)
}

func HandleConnection(conn *websocket.Conn) {
	for {
		var rawMessage string
		err := websocket.Message.Receive(conn, &rawMessage)
		if err != nil {
			if err.Error() == "EOF" {
				continue
			}
			log.Println("WebSocket closed: ", err)
			break
		}

		var msg map[string]string
		if err := json.Unmarshal([]byte(rawMessage), &msg); err != nil {
			log.Println("Error decoding message:", err)
			sendJSON(conn, map[string]any{
				"type":    "error",
				"message": "Invalid JSON format",
			})
			continue
		}

		log.Printf("Received Message: %v", msg)

		_, ok := msg["username"]

		if ok {
			mu.Lock()
			onlineUsers[msg["username"]] = conn
			mu.Unlock()

			// Notify all users about the updated online users list
			go func() {
				for _, userConn := range onlineUsers {
					if userConn != nil {
						sendJSON(userConn, map[string]any{
							"type":   "onlineusers",
							"online": online(),
						})
					}
				}
			}()

			// Monitor the connection and remove the user when it closes
			go func(username string, userConn *websocket.Conn) {
				defer func() {
					mu.Lock()
					delete(onlineUsers, username)
					mu.Unlock()

					// Notify all users about the updated online users list
					for _, userConn := range onlineUsers {
						if userConn != nil {
							sendJSON(userConn, map[string]any{
								"type":   "onlineusers",
								"online": online(),
							})
						}
					}
				}()

				// Wait for the connection to close
				buf := make([]byte, 1)
				for {
					if _, err := userConn.Read(buf); err != nil {
						break
					}
				}
			}(msg["username"], conn)

		}

		switch msg["type"] {
		case "getposts":
			getposts(conn)
		case "reaction":
			action, err := ReactionHandler(msg["userid"], msg["postid"], msg["reaction"])
			if err != nil {
				log.Println("Error adding reaction")
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": err.Error(),
				})
			} else {
				log.Println("Reaction added")
				sendJSON(conn, map[string]any{
					"type":     "reaction",
					"id":       msg["postid"],
					"action":   action,
					"reaction": msg["reaction"],
				})
			}
		case "getuser":
			_, ok := SessionStore[msg["session"]]
			if !ok {
				log.Println(msg["session"])
				log.Println("no session found")
				log.Println(SessionStore)
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "invalid session",
				})
			} else {
				user, err := repositories.GetUserBySession(msg["session"])
				if err != nil {
					sendJSON(conn, map[string]any{
						"type":    "error",
						"message": "invalid session",
					})
				} else {
					sendJSON(conn, map[string]any{
						"type": "getuser",
						"user": user,
					})
				}

			}
		case "getusers":
			users, err := repositories.GetUsers()
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			} else {
				sendJSON(conn, map[string]any{
					"type":   "getusers",
					"users":  users,
					"online": online(),
				})
			}
		case "messaging":
			sender, err := repositories.GetUserByName(msg["sender"])
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			log.Println("check receiver ", msg["receiver"])
			receiver, err := repositories.GetUserByName(msg["receiver"])
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			_, err = repositories.InsertRecord(util.DB, " tblMessages", []string{"receiver_id", "sender_id", "body"}, receiver.ID, sender.ID, html.EscapeString(msg["message"]))
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			sendJSON(conn, map[string]any{
				"type":     "messaging",
				"status":   "ok",
				"message":  html.EscapeString(msg["message"]),
				"sender":   sender,
				"receiver": receiver,
			})

			_, ok := onlineUsers[receiver.Username]
			if ok {
				sendJSON(onlineUsers[receiver.Username], map[string]any{
					"type":     "messaging",
					"status":   "ok",
					"message":  html.EscapeString(msg["message"]),
					"sender":   sender,
					"receiver": receiver,
				})
			}
		case "chats":
			id, err := strconv.Atoi(msg["sender"])
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			users, err := repositories.GetActiveChats(id)
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			} else {
				sendJSON(conn, map[string]any{
					"type":   "chats",
					"users":  users,
					"online": online(),
				})
			}
		case "conversation":
			senderid, err := strconv.Atoi(msg["sender"])
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			receiverid, err := strconv.Atoi(msg["receiver"])
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			receiver, err := repositories.GetUserBYId(receiverid)
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			messages, err := repositories.GetConversation(senderid, receiverid)
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			} else {
				sendJSON(conn, map[string]any{
					"type":         "conversation",
					"conversation": messages,
					"user":         receiver,
				})
			}
		case "register":
			register(msg["sender"], conn)
		case "createpost":
			id, err := strconv.Atoi(msg["userid"])
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			}
			err = CreatePost(msg["title"], msg["body"], msg["file"], id)
			if err != nil {
				sendJSON(conn, map[string]any{
					"type":    "error",
					"message": "unexpected error occured",
				})
			} else {
				getposts(conn)
			}
		default:
			log.Println("Unknown message type:", msg["type"])
			sendJSON(conn, map[string]any{
				"type":    "error",
				"message": "Invalid message type",
			})
		}
	}
}

// Helper function to send JSON response
func sendJSON(conn *websocket.Conn, data any) {
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

func online() (users []string) {
	for key := range onlineUsers {
		users = append(users, key)
	}
	return
}

func register(sender string, conn *websocket.Conn) {
	getposts(conn)
	id, err := strconv.Atoi(sender)
	if err != nil {
		sendJSON(conn, map[string]any{
			"type":    "error",
			"message": "unexpected error occured",
		})
	}
	users, err := repositories.GetActiveChats(id)
	if err != nil {
		sendJSON(conn, map[string]any{
			"type":    "error",
			"message": "unexpected error occured",
		})
	} else {
		sendJSON(conn, map[string]any{
			"type":   "chats",
			"users":  users,
			"online": online(),
		})
	}
}

func getposts(conn *websocket.Conn) {
	posts, err := repositories.GetPosts(util.DB)
	if err != nil {
		log.Println("Error fetching posts:", err)
		sendJSON(conn, map[string]any{
			"type":    "error",
			"message": "An unexpected error occurred. Try again later.",
		})
		return
	}

	posts, err = PostDetails(posts)
	if err != nil {
		log.Println("Error processing posts:", err)
		sendJSON(conn, map[string]any{
			"type":    "error",
			"message": err.Error(),
		})
		return
	}

	sendJSON(conn, map[string]any{
		"type":  "posts",
		"posts": posts,
	})
}
