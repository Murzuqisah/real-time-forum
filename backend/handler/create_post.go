package handler

import (
	"encoding/base64"
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jesee-kuya/forum/backend/repositories"
	"github.com/jesee-kuya/forum/backend/util"
)

/*
UploadMedia handler function is responsible for performing server operations to enable media upload with a file size limit of up to 20 megabytes.
*/
func CreatePost(filesource, title, body string, userId int) error {
	var url string
	var file []byte
	var err error
	// Create the img directory if it does not exist
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		log.Println("Failed to create uploads directory:", err)
		return err
	}


	if len(filesource) > 0 {
		file, err = base64.StdEncoding.DecodeString(filesource)
		if err != nil {
			log.Println("Failed to decode base64 string:", err)
			return err
		}
		
	} else {
		file = nil
	}


	if file != nil {

		fileExt := http.DetectContentType(file)

		switch {
		case strings.HasPrefix(fileExt, "image/jpeg"):
			fileExt = ".jpg"
		case strings.HasPrefix(fileExt, "image/png"):
			fileExt = ".png"
		case strings.HasPrefix(fileExt, "image/gif"):
			fileExt = ".gif"
		case strings.HasPrefix(fileExt, "image/webp"):
			fileExt = ".webp"
		case strings.HasPrefix(fileExt, "video/mp4"):
			fileExt = ".mp4"
		case strings.HasPrefix(fileExt, "video/quicktime"):
			fileExt = ".mov"
		default:
			log.Println("Unsupported file type:", fileExt)
			return fmt.Errorf("unsupported file type: %s", fileExt)
		}

		// Create a temporary file with the correct extension
		tempFile, err := os.CreateTemp("uploads", "upload-*"+fileExt)
		if err != nil {
			log.Println("Failed to read file:", err)
			return err
		}
		defer tempFile.Close()

		// Write the uploaded file content to the temp file
		_, err = tempFile.Write(file)
		if err != nil {
			log.Println("Failed to write file:", err)
			return err
		}
		tempFilePath := tempFile.Name()
		url = fmt.Sprintf("%v", tempFilePath)
	}

	_, err = repositories.InsertRecord(util.DB, "tblPosts", []string{"post_title", "body", "media_url", "user_id"}, html.EscapeString(title), html.EscapeString(body), url, userId)
	if err != nil {
		log.Println("failed to add post", err)
		return err
	}

	// for _, category := range categories {
	// 	repositories.InsertRecord(util.DB, "tblPostCategories", []string{"post_id", "category"}, id, category)
	// }

	return nil
}

