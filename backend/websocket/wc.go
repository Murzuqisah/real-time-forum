package websocket

import (
	"fmt"
	"log"
	"net/http"
	"time"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/jesee-kuya/forum/backend/util"
)

var writeMutex sync.Mutex

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		allowedOrigins := map[string]bool{
			"http://localhost:9000": true,
		}
		return allowedOrigins[r.Header.Get("Origin")]
	},
}

func WSEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// upgrade to a websocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error creating a connection: %v", err)
		util.ErrorHandler(w, "Websocket upgrade failed", http.StatusBadRequest)
		return
	}
	defer ws.Close()

	// keep websocket connection alive to avoid timeouts
	ws.SetPingHandler(func(appData string) error {
		log.Printf("Received Ping, sending Pong: %v", appData)
		return ws.WriteMessage(websocket.PongMessage, []byte(appData))
	})

	// R/W timeout
	ws.SetReadDeadline(time.Now().Add(30 * time.Second))
	ws.SetPongHandler(func(appData string) error {
		ws.SetReadDeadline(time.Now().Add(30 * time.Second))
		return nil
	})

	log.Println("Client connected")
	Read(ws)
}

func Read(conn *websocket.Conn) {
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			return
		}
		fmt.Println(p)

		if err := Write(conn, messageType, p); err != nil {
			log.Printf("Error writing message: %v", err)
		}
	}
}

func Write(ws *websocket.Conn, messageType int, data []byte) error {
	writeMutex.Lock()
	defer writeMutex.Unlock()
	return ws.WriteMessage(messageType, data)
}