package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/jesee-kuya/forum/backend/models"
	"github.com/jesee-kuya/forum/backend/util"
	_ "github.com/mattn/go-sqlite3" // SQLite3 driver
)

type Session struct {
	UserId int `json:"user_id"`
}

// insertPost inserts a Post into the tblPosts table
func InsertRecord(db *sql.DB, table string, columns []string, values ...interface{}) (int64, error) {
	// Constructing column names and placeholders
	columnsStr := strings.Join(columns, ", ")
	placeholders := strings.Repeat("?, ", len(columns))
	placeholders = strings.TrimSuffix(placeholders, ", ")

	// Constructing the SQL query dynamically
	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, columnsStr, placeholders)

	// Executing the query
	result, err := db.Exec(query, values...)
	if err != nil {
		return 0, fmt.Errorf("failed to insert into %s: %w", table, err)
	}

	// Retrieving the last inserted ID
	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve last insert ID for %s: %w", table, err)
	}

	return id, nil
}

// deletePost deletes a record from tblPosts based on its ID
func DeleteRecord(db *sql.DB, table, column string, id int) error {
	// Use a parameterized query for safety
	query := fmt.Sprintf("UPDATE %s SET %s = ? WHERE id = ?", table, column)

	// Execute the query safely with parameters
	result, err := db.Exec(query, "Deleted", id)
	if err != nil {
		return fmt.Errorf("failed to delete record from %s: %w", table, err)
	}

	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to retrieve affected rows: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no record found with ID %d in %s", id, table)
	}

	log.Printf("Successfully marked record with ID %d as deleted in table %s", id, table)
	return nil
}

func GetUserByEmail(email string) (models.User, error) {
	var user models.User
	var password sql.NullString // handle NULL passwords

	query := "SELECT id, username, email, user_password FROM tblUsers WHERE email = ?"
	err := util.DB.QueryRow(query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&password,
	)
	if err != nil {
		return user, err
	}

	// Only set the password if it's not NULL
	if password.Valid {
		user.Password = password.String
	}

	return user, nil
}

func GetUserByName(name string) (models.User, error) {
	query := "SELECT id, username, email, user_password FROM tblUsers WHERE username  = ?"
	row := util.DB.QueryRow(query, name)
	user, err := UserDetails(row)
	return user, err
}

func GetUserBYId(id int) (models.User, error) {
	query := "SELECT id, username, email, user_password FROM tblUsers WHERE id = ?"
	row := util.DB.QueryRow(query, id)
	user, err := UserDetails(row)
	return user, err
}

func GetUserBySession(session string) (models.User, error) {
	var ses Session
	var user models.User
	query := "SELECT user_id FROM tblSessions Where session_token = ?"
	row := util.DB.QueryRow(query, session)
	err := row.Scan(&ses.UserId)
	if err != nil {
		return user, errors.New("invalid session")
	}
	user, err = GetUserBYId(ses.UserId)
	if err != nil {
		return user, errors.New("invalid session")
	}
	return user, nil
}

func GetUsers() ([]models.User, error) {
	var users []models.User
	rows, err := util.DB.Query("SELECT id, username FROM tblUsers")
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Username); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return users, nil
}

func UserDetails(row *sql.Row) (models.User, error) {
	var user models.User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return user, fmt.Errorf("user not found")
		}
		return user, fmt.Errorf("failed to retrieve user: %v", err)
	}
	return user, nil
}
