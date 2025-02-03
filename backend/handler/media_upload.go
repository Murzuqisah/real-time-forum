package handler

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/jesee-kuya/forum/backend/util"
)

/*
UploadMedia handler function is responsible for performing server operations to enable media upload with a file size limit of up to 25 mbs.
*/
func UploadMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		util.ErrorHandler(w, "Invalid request method", http.StatusMethodNotAllowed)
		log.Println("Invalid request method:", r.Method)
		return
	}

	// Create the img directory if it does not exist
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		log.Println("Failed to create uploads directory:", err)
		return
	}

	// Parse the multipart form with a 25MB limit
	err := r.ParseMultipartForm(25 << 20)
	if err != nil {
		util.ErrorHandler(w, "Failed parsing form data", http.StatusBadRequest)
		log.Println("Failed parsing multipart form:", err)
		return
	}

	file, handler, err := r.FormFile("uploaded-file")
	if err != nil {
		util.ErrorHandler(w, "File upload error", http.StatusBadRequest)
		log.Println("Failed retrieving media file:", err)
		return
	}
	defer file.Close()

	fmt.Printf("Content Type: %v\n", handler.Header)

	fmt.Printf("Successfully uploaded file: %v\n", handler.Filename)

	// Validate MIME type and get the file extension
	fileExt, err := ValidateMimeType(file)
	if err != nil {
		util.ErrorHandler(w, err.Error(), http.StatusBadRequest)
		log.Println("Invalid extension associated with file:", err)
		return
	}

	// Create a temporary file with the correct extension
	tempFile, err := os.CreateTemp("uploads", "upload-*"+fileExt)
	if err != nil {
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		log.Println("Failed creating a temporary file:", err)
		return
	}
	defer tempFile.Close()

	// Copy file contents to the temporary file
	_, err = io.Copy(tempFile, file)
	if err != nil {
		util.ErrorHandler(w, "An Unexpected Error Occurred. Try Again Later", http.StatusInternalServerError)
		log.Println("Failed saving file to temporary location:", err)
		return
	}
	fmt.Fprintf(w, "Successfully uploaded file.\n")
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

/*
ValidateMimeType is used to check the MIME type of an uploaded file. It returns the extension associated with the file.
*/
func ValidateMimeType(file multipart.File) (string, error) {
	allowedMIMEs := map[string]string{
		"image/jpeg": ".jpg",
		"image/png":  ".png",
		"image/gif":  ".gif",
		"image/webp": ".webp",
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
