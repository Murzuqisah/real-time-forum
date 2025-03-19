package websocket

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func WSEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// hijack network connection
	h, ok := w.(http.Hijacker)
	if !ok {
		log.Printf("Hijacking not supported: %v", ok)
		http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
		return
	}
	
	conn, buf, err := hijacker.Hijack()
	if err != nil {
		log.Printf("Hijacking error: %v", err)
		return
	}
	
	// upgrade to a websocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error creating a connection: %v", err)
	}

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

		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Printf("Error writing message: %v", err)
		}
	}
}
