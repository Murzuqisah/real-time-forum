package websocket

import (
	"bufio"
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
	
	conn, buf, err := h.Hijack()
	if err != nil {
		log.Printf("Hijacking error: %v", err)
		return
	}

	// Resuses Reader instead of allocating a new one
	// if the read buffer size is configured and hijacked reader is large enough
	var br *bufio.Reader
	if buf != nil {
		buffer := bufio.NewReaderSize(buf, 1024)
		br = buffer
	}

	// compute websocket accept key
	Key := r.Header.Get("Sec-Websocket-Key")
	if Key == "" {
		log.Print("Key cannot be empty")
		conn.Close()
		return
	}
	acceptKey := computeWSKey(Key)
	
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
