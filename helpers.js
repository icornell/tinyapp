const getUserByEmail = (email, userDatabase) => {
  ///DRY code to find a user by email
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
  return false;
};

module.exports = { getUserByEmail };