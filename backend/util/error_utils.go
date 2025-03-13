package util

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type Message struct {
	Code       string
	ErrMessage string
}

func ErrorHandler(w http.ResponseWriter, errval string, statusCode int) {
	code := strconv.Itoa(statusCode)

	data := Message{
		Code:       code,
		ErrMessage: errval,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)s
}
