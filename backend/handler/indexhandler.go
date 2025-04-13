package handler

import (
	"encoding/json"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
	"golang.org/x/net/html"
	"golang.org/x/net/websocket"
)

// Client wraps the websocket connection with its own send channel.
type Client struct {
	username string
	conn     *websocket.Conn
	send     chan string
}

// Global map of online users now holds *Client instead of *websocket.Conn.
var (
	onlineUsers = make(map[string]*Client)
	mu          sync.RWMutex // Use RWMutex for concurrent reads.
)

// HandleWebsocket creates a new Client for the connection and starts its writePump.
func HandleWebsocket(ws *websocket.Conn) {
	client := &Client{
		conn: ws,
		send: make(chan string, 256), // Buffered channel.
	}
	go client.writePump()
	defer ws.Close()
	HandleConnection(client)
}

// writePump continuously sends messages from the client's send channel over the WebSocket.
func (c *Client) writePump() {
	for msg := range c.send {
		if err := websocket.Message.Send(c.conn, msg); err != nil {
			log.Println("Error sending message:", err)
			break
		}
	}
}

// sendJSON marshals the data into JSON and sends it via the client's send channel.
func sendJSON(c *Client, data any) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Println("Error encoding JSON:", err)
		return
	}
	select {
	case c.send <- string(jsonData):
	case <-time.After(1 * time.Second):
		log.Println("Warning: message send timed out")
	}
}

// sendError is a helper function for sending error messages.
func sendError(c *Client, errMsg string) {
	sendJSON(c, map[string]any{
		"type":    "error",
		"message": errMsg,
	})
}

// HandleConnection reads messages from the client and processes them.
func HandleConnection(client *Client) {
	for {
		var rawMessage string
		err := websocket.Message.Receive(client.conn, &rawMessage)
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
			sendError(client, "Invalid JSON format")
			continue
		}

		log.Printf("Received Message: %v", msg)

		// If a username is provided, add the client to the online users list.
		if username, ok := msg["username"]; ok {
			client.username = username
			mu.Lock()
			onlineUsers[username] = client
			mu.Unlock()
			go broadcastOnlineUsers()
			go monitorConnection(username, client)
		}

		switch msg["type"] {
		case "getposts":
			getposts(client)
		case "reaction":
			err := ReactionHandler(msg["userid"], msg["postid"], msg["reactionType"])
			if err != nil {
				log.Println("Error adding reaction:", err)
				sendError(client, err.Error())
				continue
			}
			getposts(client)
		case "getuser":
			if _, ok := SessionStore[msg["session"]]; !ok {
				log.Println("Invalid session:", msg["session"])
				sendError(client, "invalid session")
				continue
			}
			user, err := repositories.GetUserBySession(msg["session"])
			if err != nil {
				sendError(client, "invalid session")
				continue
			}
			sendJSON(client, map[string]any{
				"type": "getuser",
				"user": user,
			})
		case "getusers":
			users, err := repositories.GetUsers()
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			sendJSON(client, map[string]any{
				"type":   "getusers",
				"users":  users,
				"online": online(),
			})
		case "messaging":
			sender, err := repositories.GetUserByName(msg["sender"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			log.Println("Check receiver", msg["receiver"])
			receiver, err := repositories.GetUserByName(msg["receiver"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			_, err = repositories.InsertRecord(util.DB, " tblMessages",
				[]string{"receiver_id", "sender_id", "body"},
				receiver.ID, sender.ID, html.EscapeString(msg["message"]))
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			sendJSON(client, map[string]any{
				"type":     "messaging",
				"status":   "ok",
				"message":  html.EscapeString(msg["message"]),
				"sender":   sender,
				"receiver": receiver,
			})
			mu.RLock()
			receiverClient, exists := onlineUsers[receiver.Username]
			mu.RUnlock()
			if exists {
				sendJSON(receiverClient, map[string]any{
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
				sendError(client, "unexpected error occured")
				continue
			}
			users, err := repositories.GetActiveChats(id)
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			sendJSON(client, map[string]any{
				"type":   "chats",
				"users":  users,
				"online": online(),
			})
		case "conversation":
			senderid, err := strconv.Atoi(msg["sender"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			receiverid, err := strconv.Atoi(msg["receiver"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			receiver, err := repositories.GetUserBYId(receiverid)
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			messages, err := repositories.GetConversation(senderid, receiverid)
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			sendJSON(client, map[string]any{
				"type":         "conversation",
				"conversation": messages,
				"user":         receiver,
			})
		case "register":
			register(msg["sender"], client)
		case "comment":
			userid, err := strconv.Atoi(msg["userid"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			id, err := strconv.Atoi(msg["commentid"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			err = Comment(userid, id, msg["comment"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}

			sendJSON(client, map[string]any{
				"type":    "comment",
				"comment": msg["comment"],
			})
		default:
			log.Println("Unknown message type:", msg["type"])
			sendError(client, "Invalid message type")
		}
	}
}

// broadcastOnlineUsers sends the updated online users list to every client.
func broadcastOnlineUsers() {
	mu.RLock()
	onlineList := online()
	clients := make([]*Client, 0, len(onlineUsers))
	for _, c := range onlineUsers {
		clients = append(clients, c)
	}
	mu.RUnlock()

	for _, c := range clients {
		sendJSON(c, map[string]any{
			"type":   "onlineusers",
			"online": onlineList,
		})
	}
}

// monitorConnection watches for connection closure and removes the client.
func monitorConnection(username string, client *Client) {
	buf := make([]byte, 1)
	for {
		if _, err := client.conn.Read(buf); err != nil {
			break
		}
	}
	mu.Lock()
	delete(onlineUsers, username)
	mu.Unlock()
	broadcastOnlineUsers()
}

// online returns a list of usernames currently online.
func online() (users []string) {
	mu.RLock()
	defer mu.RUnlock()
	for key := range onlineUsers {
		users = append(users, key)
	}
	return
}

func register(sender string, client *Client) {
	getposts(client)
	id, err := strconv.Atoi(sender)
	if err != nil {
		sendError(client, "unexpected error occured")
		return
	}
	users, err := repositories.GetActiveChats(id)
	if err != nil {
		sendError(client, "unexpected error occured")
		return
	}
	sendJSON(client, map[string]any{
		"type":   "chats",
		"users":  users,
		"online": online(),
	})
}

func getposts(client *Client) {
	posts, err := repositories.GetPosts(util.DB)
	if err != nil {
		log.Println("Error fetching posts:", err)
		sendError(client, "An unexpected error occurred. Try again later.")
		return
	}

	posts, err = PostDetails(posts)
	if err != nil {
		log.Println("Error processing posts:", err)
		sendError(client, err.Error())
		return
	}

	sendJSON(client, map[string]any{
		"type":  "posts",
		"posts": posts,
	})
}
