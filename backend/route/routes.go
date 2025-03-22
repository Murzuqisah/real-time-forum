package route

import (
	"net/http"

	"github.com/jesee-kuya/forum/backend/handler"
)

func InitRoutes() *http.ServeMux {
	r := http.NewServeMux()

	fs := http.FileServer(http.Dir("./frontend"))
	r.Handle("/frontend/", http.StripPrefix("/frontend/", fs))

	uploadFs := http.FileServer(http.Dir("./uploads"))
	r.Handle("/uploads/", http.StripPrefix("/uploads/", uploadFs))

	r.Handle("/", http.FileServer(http.Dir("./frontend/templates")))

	r.HandleFunc("/ws", handler.HandleWebsocket)
	return r
}
