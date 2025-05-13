# real-time-forum-typinging-in-progress

This project is a web forum that allows users to communicate, share posts, comment, and interact with one another through likes/dislikes, filtering, and more.

---

## Objectives

- **User Communication**:  
  Allow users to create posts and comments to facilitate discussion.

- **Categorized Posts**:  
  Users can associate one or more categories to their posts, functioning similarly to subforums dedicated to specific topics.

- **Likes and Dislikes**:  
  Registered users can like or dislike posts and comments. The total counts of likes and dislikes will be visible to all users.

- **Filtering**:  
  Implement filtering for posts by:

  - Categories
  - Created posts (for the logged-in user)
  - Liked posts (for the logged-in user)

- **Direct Messages**:
  Implement direct messages between signed-up users

  - Chat notifications
  - Real-time typing status
  - Online status

---

## Technologies Used

- **Language**: Go (Golang), JavaScript(JS), HTML, CSS

- **Database**: SQLite

  - SQLite is chosen for its simplicity as an embedded database and ease of integration in web applications.

- **Authentication and Session Management**:

  - User registration and login with email, username, and password.
  - Use cookies for session management with a 24-hour time period.
    - Encrypting passwords using `bcrypt`.
    - Implementing session identifiers using `UUID`.

- **Docker**:
  - Containerizing the application for consistent deployment and easy environment management.

---

## Authentication

### User Registration

- **Input Requirements:**

  - **Nickname**
  - **First name**
  - **Last name**
  - **Gender**
  - **Age**
  - **Email**: Must be unique. Cannot register a user if the email is already registered.

  - **Password**: Encrypted when stored (uses `bcrypt` for encryption).

### Login

- Validate user credentials against stored records.
- Check that the password provided matches the encrypted password in the database.
- On successful login, it creates a session cookie with an expiration date; with only one active session per user.

---

### Communication

- **Posts & Comments:**
  - Only registered users can create posts and comments.
  - Posts can be associated with one or more categories.
  - Both posts and comments are visible to all users, regardless of registration status.
  - Non-registered users can only view posts and comments but cannot interact with them (no reaction; like, dislike, or comments).

---

### Likes and Dislikes

- **Functionality:**
  - Only registered users can like or dislike posts and comments.
  - The count of likes and dislikes is visible to all users.

---

### Filtering

- **Categories:**  
  Users can filter posts by specific categories (similar to subforums).

- **Created Posts:**  
  Registered users can filter posts that they have created.
- **Liked Posts:**  
  Registered users can filter posts that they have liked.

---

### Direct Messages

- Registered users can send direct messages to other registered users, get notified on reception of new messages.
- Typing status displayed in a chat

- Registered users can view who is online/offline

## Installation

1. Clone the repository:

   ```bash
   git clone https://learn.zone01kisumu.ke/git/jamos/real-time-forum.git
   cd real-time-forum
   ```

2. Compile and run the program with a file as input:

   ```bash
   go run main.go
   ```

### Docker

To ensure ease of deployment and consistency across environments, this project uses Docker.

**Building an Image**:

```bash
docker build -t forum .
```

- You can build using `docker-compose.yml`:

```bash
docker compose up --build
```

## Contribution

- To make a contribution to the project, open an issue with a title, a tag, and a description of your idea on the [repository issues' page](https://github.com/Murzuqisah/real-time-forum/issues).

## License

This project is licensed under [MIT](https://github.com/Murzuqisah/real-time-forum/blob/main/LICENSE).
