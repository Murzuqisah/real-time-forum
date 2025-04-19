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

// Client wraps the websocket connection with channels for sending and processing messages.
type Client struct {
	username    string
	conn        *websocket.Conn
	send        chan string
	processChan chan map[string]string
	mu          sync.Mutex
}

var (
	onlineUsers = make(map[string]*Client)
	mu          sync.RWMutex
)

// HandleWebsocket initializes client and starts processing goroutines.
func HandleWebsocket(ws *websocket.Conn) {
	client := &Client{
		conn:        ws,
		send:        make(chan string, 2048),
		processChan: make(chan map[string]string, 100),
	}
	go client.writePump()
	go client.processMessages()
	defer ws.Close()

	// Main loop to read messages and send to processChan
	for {
		var rawMessage string
		err := websocket.Message.Receive(client.conn, &rawMessage)
		if err != nil {
			log.Println("WebSocket read error:", err)
			break
		}

		var msg map[string]string
		if err := json.Unmarshal([]byte(rawMessage), &msg); err != nil {
			sendError(client, "Invalid JSON format")
			continue
		}

		client.processChan <- msg
	}

	// Cleanup on connection close
	close(client.processChan)
	client.mu.Lock()
	username := client.username
	client.mu.Unlock()

	mu.Lock()
	if username != "" {
		delete(onlineUsers, username)
	}
	mu.Unlock()
	broadcastOnlineUsers()
}

// writePump sends messages from the send channel to the WebSocket.
func (c *Client) writePump() {
	for msg := range c.send {
		if err := websocket.Message.Send(c.conn, msg); err != nil {
			log.Println("Error sending message:", err)
			break
		}
	}
}

// processMessages handles messages from processChan in order.
func (client *Client) processMessages() {
	for msg := range client.processChan {
		log.Printf("Processing message: %v", msg)

		if username, ok := msg["username"]; ok {
			client.mu.Lock()
			if client.username == "" {
				client.username = username
				mu.Lock()
				onlineUsers[username] = client
				mu.Unlock()
				go broadcastOnlineUsers()
			}
			client.mu.Unlock()
		}

		switch msg["type"] {
		case "getusers":
			users, err := repositories.GetUsers()
			if err != nil {
				sendError(client, "unexpected error occurred")
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

			receiver, err := repositories.GetUserByName(msg["receiver"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			id, err := repositories.InsertRecord(util.DB, " tblMessages",
				[]string{"receiver_id", "sender_id", "body", "username"},
				receiver.ID, sender.ID, html.EscapeString(msg["message"]), sender.Username)
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}

			message, err := repositories.Getmessage(int(id))
			message.SentOn = message.SentOn.UTC()
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			sendJSON(client, map[string]any{
				"type":     "messaging",
				"status":   "ok",
				"message":  message,
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
					"message":  message,
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

			unread, err := repositories.UnreadMessages(id)
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			sendJSON(client, map[string]any{
				"type":   "chats",
				"users":  users,
				"online": online(),
				"unread": unread,
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

			for i := range messages {
				messages[i].SentOn = messages[i].SentOn.UTC()
			}

			sendJSON(client, map[string]any{
				"type":         "conversation",
				"conversation": messages,
				"user":         receiver,
			})
		case "register":
			register(msg["sender"], client)
		case "typing":
			sender, err := repositories.GetUserByName(msg["sender"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}

			receiver, err := repositories.GetUserByName(msg["receiver"])
			if err != nil {
				sendError(client, "unexpected error occured")
				continue
			}
			mu.RLock()
			receiverClient, exists := onlineUsers[receiver.Username]
			mu.RUnlock()
			if exists {
				sendJSON(receiverClient, map[string]any{
					"type":     "typing",
					"status":   "ok",
					"sender":   sender,
					"receiver": receiver,
				})
			}
		default:
			log.Println("Unknown message type:", msg["type"])
			sendError(client, "Invalid message type")
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
	unread, err := repositories.UnreadMessages(id)
	if err != nil {
		sendError(client, "unexpected error occured")
		return
	}
	sendJSON(client, map[string]any{
		"type":   "chats",
		"users":  users,
		"online": online(),
		"unread": unread,
	})
}
