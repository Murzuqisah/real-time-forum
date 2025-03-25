
// MockData service for messenger app
class MessengerData {
  constructor () {
    this.currentUser = this.current
  }
  users = []
  getUsers(){
    fetch('/users', {
    })
    .then(response => {
      if (!response.ok) {
        alert('unexpected error occured')
      }
      return response.JSON()
    })
    .then(data => {
      data.users.forEach(element => {
        let user
        user.id = element.id
        user.name = element.username
        users.push(user)
      });

      data.sessions.forEach(element => {
        for (i = 0 ; i < users.length; i++) {
          if (users[i].id === element.user_id) {
            users[i].status = 'online'
            break
          }
        }
      })
    })
  }

  current(user){
    return user
  }

  getCurrentUser() {
    return this.currentUser
  }

  conversations = []
  messages = {}
  getUserConversations(){
    fetch('/conversations', {
      body: this.currentUser.id
    })
    .then(response => {
      if (!response.ok) {
        alert('unexpected error occured')
      }
      return response.JSON()
    })
    .then(data => {
      data.messages.forEach(element => {
        if (this.messages[element.conversation_id]) {
          this.messages[element.conversation_id] = [];
          this.conversations.push[this.messages[element.conversation_id]]
        }
        this.messages[element.conversation_id].push(element)
      })
    })
  }
  
}

// Export the class
window.MessengerData = MessengerData;
