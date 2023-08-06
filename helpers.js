const getUserByEmail = (email, userDatabase) => {
  ///DRY code to find a user by email
  for (const userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      return userID;
    }
  }
};

module.exports = { getUserByEmail };
