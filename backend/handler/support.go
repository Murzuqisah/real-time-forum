package handler

import (
	"log"
	"net/http"
	"regexp"

	"github.com/gofrs/uuid"
)

func CreateSession(id int) string {
	mu.Lock()
	defer mu.Unlock()

	sessionID := uuid.Must(uuid.NewV4()).String()
	SessionStore[sessionID] = id
	log.Println(SessionStore)
	return sessionID
}

func getSessionID(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return "", http.ErrNoCookie
	}
	return cookie.Value, nil
}

func EnableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
}

func isValidEmail(email string) bool {
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	return re.MatchString(email)
}

func DeleteSession(userId int) {
	mu.Lock()
	defer mu.Unlock()

	if len(SessionStore) == 0 {
		return
	}
	for k, v := range SessionStore {
		if v == userId {
			delete(SessionStore, k)
			break
		}
	}
}
