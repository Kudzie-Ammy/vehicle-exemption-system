// userStore.js - This is the shared in-memory store module
let userStore = {};

// Function to add user data
function addUser(username, userData) {
  userStore[username] = userData;
}

// Function to get user data
function getUser(username) {
  return userStore[username];
}

// Function to remove user data
function removeUser(username) {
  delete userStore[username];
}

module.exports = { addUser, getUser, removeUser };
