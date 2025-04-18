package handler

import (
	"encoding/json"
	"fmt"
	"html"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

/*
UploadMedia handler function is responsible for performing server operations to enable media upload with a file size limit of up to 20 megabytes.
*/
func CreatePost(w http.ResponseWriter, r *http.Request) {
	var url string
	if r.Method != http.MethodPost {
		log.Println("Invalid request method:", r.Method)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	// Create the img directory if it does not exist
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		log.Println("Failed to create uploads directory:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	// Parse the multipart form with a 20MB limit
	err := r.ParseMultipartForm(20 << 20)
	if err != nil {
		log.Println("Failed parsing multipart form:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	file, header, err := r.FormFile("uploaded-file")
	if err != nil {
		if err.Error() == "http: no such file" {
			log.Println("No file uploaded, continuing process.")
		} else {
			log.Println("Failed retrieving media file:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}
	}

	if file != nil {
		defer file.Close()

		if header.Size > 20<<20 {
			log.Println("File size exceeds 20MB limit")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "The uploaded file is too large. Please upload a file less than 20MB.",
			})
			return
		}

		// Validate MIME type and get the file extension
		fileExt, err := ValidateMimeType(file)
		if err != nil {
			log.Println("Invalid extension associated with file:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Invalid extension associated with file",
			})
			return
		}

		_, err = file.Seek(0, 0)
		if err != nil {
			log.Println("Failed to reset file pointer:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}

		// Create a temporary file with the correct extension
		tempFile, err := os.CreateTemp("uploads", "upload-*"+fileExt)
		if err != nil {
			log.Println("Failed to read file:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}
		defer tempFile.Close()

		fileBytes, err := io.ReadAll(file)
		if err != nil {
			log.Println("Failed to read file:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
			return
		}

		// Write the uploaded file content to the temp file
		_, err = tempFile.Write(fileBytes)
		if err != nil {
			log.Println("Failed to write file:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "unknown error occured. Try again later",
			})
		}
		tempFilePath := tempFile.Name()
		url = fmt.Sprintf("%v", tempFilePath)
	}

	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("Invalid Session")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	id, err := repositories.InsertRecord(util.DB, "tblPosts", []string{"post_title", "body", "media_url", "user_id"}, html.EscapeString(r.FormValue("post-title")), html.EscapeString(r.FormValue("post-content")), url, SessionStore[cookie])
	if err != nil {
		log.Println("failed to add post", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	err = r.ParseForm()
	if err != nil {
		log.Println("error parsing form:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	categories := r.Form["category[]"]

	for _, category := range categories {
		repositories.InsertRecord(util.DB, "tblPostCategories", []string{"post_id", "category"}, id, category)
	}

	user, err := repositories.GetUserBySession(cookie)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}

	post, err := repositories.GetPost(int(id))
	if err != nil {
		log.Println("Failed to get post:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}
	details, err := PostDetails([]models.Post{post})
	if err != nil {
		log.Println("Failed to get post details:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "unknown error occured. Try again later",
		})
		return
	}
	post = details[0]

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"error":   "ok",
		"user":    user,
		"session": cookie,
		"item":    post,
	})
}

/*
ValidateMimeType is used to check the MIME type of an uploaded file. It returns the extension associated with the file.
*/
func ValidateMimeType(file multipart.File) (string, error) {
	allowedMIMEs := map[string]string{
		"image/jpeg":    ".jpg",
		"image/jpg":     ".jpg",
		"image/jfif":    ".jjif",
		"image/pjpeg":   ".pjpeg",
		"image/pjp":     ".pjp",
		"image/png":     ".png",
		"image/gif":     ".gif",
		"image/webp":    ".webp",
		"image/svg+xml": ".svg",
		"image/bmp":     ".bmp",
		"image/avif":    ".avif",
		"image/x-ico":   ".ico",
		"image/cur":     ".cur",
		"image/tiff":    ".tiff",
		"image/tif":     ".tif",
		"image/apng":    ".apng",
	}

	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		log.Printf("Failed to read buffer: %v\n", err)
		return "", fmt.Errorf("failed to read file data")
	}

	mimeType := http.DetectContentType(buffer)
	ext, valid := allowedMIMEs[mimeType]
	if !valid {
		return "", fmt.Errorf("invalid file type")
	}
	return ext, nil
}
