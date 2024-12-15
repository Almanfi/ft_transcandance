// Initialize the conversation array for both users
let conversation = [
  { user: "user1", text: "Hi, how are you?", timestamp: new Date().toLocaleTimeString() },
  { user: "user2", text: "I'm good! How about you?", timestamp: new Date().toLocaleTimeString() },
];

// Function to update the chat window
function updateChat() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = ""; // Clear the current chat

  // Loop through the conversation array and display each message
  conversation.forEach(msg => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", msg.user);
    
    // Add the message text
    const textDiv = document.createElement("div");
    textDiv.classList.add("text");
    textDiv.textContent = msg.text;
    messageDiv.appendChild(textDiv);

    // Add the timestamp
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("time");
    timeDiv.textContent = msg.timestamp;
    messageDiv.appendChild(timeDiv);

    messagesDiv.appendChild(messageDiv);
  });

  // Scroll to the latest message
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to send a new message
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value.trim();
  
  if (messageText === "") return; // Don't send empty messages

  // Add the new message to the conversation (user1 for now)
  conversation.push({
    user: "user1",
    text: messageText,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // Update the chat window
  updateChat();

  // Clear the input field
  messageInput.value = "";
  
  // Simulate a response from user2 after 1 second (for demo purposes)
  setTimeout(() => {
    conversation.push({
      user: "user2",
      text: "Got your message!",
      timestamp: new Date().toLocaleTimeString()
    });
    updateChat();
  }, 1000);
}

// Event listener for the send button
document.getElementById("sendBtn").addEventListener("click", sendMessage);

// Allow pressing Enter to send a message
document.getElementById("messageInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Initial chat update
updateChat();
