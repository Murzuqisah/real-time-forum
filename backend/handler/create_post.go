package handler

import (
	"fmt"
	"html"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"

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
		util.ErrorHandler(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Create the img directory if it does not exist
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		log.Println("Failed to create uploads directory:", err)
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		return
	}

	// Parse the multipart form with a 20MB limit
	err := r.ParseMultipartForm(20 << 20)
	if err != nil {
		log.Println("Failed parsing multipart form:", err)
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		return
	}

	file, header, err := r.FormFile("uploaded-file")
	if err != nil {
		if err.Error() == "http: no such file" {
			log.Println("No file uploaded, continuing process.")
		} else {
			log.Println("Failed retrieving media file:", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}
	}

	if file != nil {
		defer file.Close()

		if header.Size > 20<<20 {
			log.Println("File size exceeds 20MB limit")
			util.ErrorHandler(w, "The uploaded file is too large. Please upload a file less than 20MB.", http.StatusBadRequest)
			return
		}

		// Validate MIME type and get the file extension
		fileExt, err := ValidateMimeType(file)
		if err != nil {
			log.Println("Invalid extension associated with file:", err)
			util.ErrorHandler(w, "Invalid extension associated with file", http.StatusBadRequest)
			return
		}

		_, err = file.Seek(0, 0)
		if err != nil {
			log.Println("Failed to reset file pointer:", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}

		// Create a temporary file with the correct extension
		tempFile, err := os.CreateTemp("uploads", "upload-*"+fileExt)
		if err != nil {
			log.Println("Failed to read file:", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}
		defer tempFile.Close()

		fileBytes, err := io.ReadAll(file)
		if err != nil {
			log.Println("Failed to read file:", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}

		// Write the uploaded file content to the temp file
		_, err = tempFile.Write(fileBytes)
		if err != nil {
			log.Println("Failed to write file:", err)
			util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
			return
		}
		tempFilePath := tempFile.Name()
		url = fmt.Sprintf("%v", tempFilePath)
	}

	cookie, err := getSessionID(r)
	if err != nil {
		log.Println("Invalid Session")
		http.Redirect(w, r, "/sign-in", http.StatusSeeOther)
		return
	}
	sessionData, err := getSessionData(cookie)
	if err != nil {
		log.Println("Invalid Session")
		http.Redirect(w, r, "/sign-in", http.StatusSeeOther)
		return
	}

	id, err := repositories.InsertRecord(util.DB, "tblPosts", []string{"post_title", "body", "media_url", "user_id"}, html.EscapeString(r.FormValue("post-title")), html.EscapeString(r.FormValue("post-content")), url, sessionData["userId"].(int))
	if err != nil {
		log.Println("failed to add post", err)
		http.Redirect(w, r, "/sign-in", http.StatusSeeOther)
		return
	}

	err = r.ParseForm()
	if err != nil {
		log.Println("error parsing form:", err)
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		return
	}

	categories := r.Form["category[]"]

	for _, category := range categories {
		repositories.InsertRecord(util.DB, "tblPostCategories", []string{"post_id", "category"}, id, category)
	}
	http.ServeFile(w, r, "frontend/templates/home.html")
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
