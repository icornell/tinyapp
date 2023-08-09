const { urlDatabase, users } = require("./database"); //require database.js file for modular code

const getUserByEmail = (email, userDatabase) => {
  ///DRY code to find a user by email
  for (const userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      return userDatabase[userID];
    }
  }
};

function generateRandomString() {
  //use for shortURL and userID
  let randomString = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += possible.charAt(
      Math.floor(Math.random() * possible.length)
    );
  }
  return randomString;
};

const urlsForUser = (userID) => {
  //DRY code to find a user by their id
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

module.exports = { urlsForUser, generateRandomString, getUserByEmail };

