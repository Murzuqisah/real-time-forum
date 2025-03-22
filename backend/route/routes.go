package route

import (
	"net/http"

	"github.com/jesee-kuya/forum/backend/handler"
	"golang.org/x/net/websocket"
)

func InitRoutes() *http.ServeMux {
	r := http.NewServeMux()

	fs := http.FileServer(http.Dir("./frontend"))
	r.Handle("/frontend/", http.StripPrefix("/frontend/", fs))

	uploadFs := http.FileServer(http.Dir("./uploads"))
	r.Handle("/uploads/", http.StripPrefix("/uploads/", uploadFs))

	r.Handle("/", http.FileServer(http.Dir("./frontend/templates")))

	r.HandleFunc("/sign-up", handler.SignupHandler)
	r.HandleFunc("/sign-in", handler.LoginHandler)

	r.Handle("/ws", websocket.Handler(handler.HandleWebsocket))
	return r
}
