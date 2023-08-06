const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session"); //require cookie-session middleware
const bcrypt = require("bcryptjs"); //require bcrypt for encryption and decryption of passwords
const helpers = require("./helpers"); //require helpers.js file for modular code

const urlDatabase = {};
const users = {};

app.set("view engine", "ejs"); // set the view engine to ejs

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

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
}

const urlsForUser = (id) => {
  //DRY code to find a user by their id
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.send("Hello! Please login or register to use TinyApp");
  }
});

app.get("/urls.json", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.json(urlsForUser(req.session.user_id)); //pass the user's urlDatabase to urls.json
  }
});

app.get("/hello", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.send(
      "Hello TinyApp User, I am TinyApp! I hope that you enjoy using me!"
    );
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id), //pass user's urlDatabase to templateVars
    user: users[req.session.user_id], //pass user id to templateVars
  };
  res.render("urls_index", templateVars); // pass templateVars to urls_index.ejs
});

app.get("/urls/new", (req, res) => {
  //create a new URL
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    //only logged in users can create new URLs
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userID: users[req.session.user_id],
      userURLs: urlsForUser(req.session.user_id),
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found, please check your URL and try again");
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL; //get the longURL from urlDatabase
  console.log(longURL); //see the longURL
  if (!longURL) {
    res.status(404).send("URL not found, please check your URL and try again");
  } else {
    //if the longURL does not exist in urlDatabase, send 404 error
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    email: req.body.email,
    password: req.body.password,
  };
  if (!templateVars.user) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    email: req.body.email,
    password: req.body.password,
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); //generate a random string variable of 6 characters
  urlDatabase[generateRandomString()] = req.body.longURL; //save the longURL into urlDatabase
  if (!req.session.user_id) {
    res.send("Please login to create a new URL");
  } //only logged in users can create new URLs
  res.redirect(`/urls/${shortURL}`); //redirect to /urls/:shortURL
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = users[req.session.user_id];
  const userURLs = urlsForUser(userID);
  if (!userURLs[req.params.id] || !userID) {
    res.status(403).send("You do not have access to this page");
  } //only logged in users can delete their own URLs
  else {
    delete urlDatabase[req.params.id].longURL; //delete the longURL from urlDatabase
    console.log(urlDatabase); //see the new urlDatabase
    res.redirect("/urls"); //redirect to /urls
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = users[req.session.user_id];
  const userURLs = urlsForUser(userID);
  if (!userURLs[req.params.id] || !userID) {
    res.status(403).send("You do not have access to this page");
  } //only logged in users can edit their own URLs
  else {
    const shortURL = req.params.id; //get the shortURL from urlDatabase
    urlDatabase[shortURL] = req.body.newURL; //save the newURL into urlDatabase
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  //set the username cookie session
  const email = req.body.email;
  const password = req.body.password;

  if (!helpers.getUserByEmail(email, users)) {
    res.status(403).send("You do not have an account with this email yet");
  } else if (helpers.getUserByEmail(email, users).password !== password) {
    res.status(403).send("Password incorrect");
  } else if (
    !bcrypt.compareSync(registeredPassword, users[registeredEmail].password)
  ) {
    //return error if password does not match
    res.status(400).send("Password does not match the provided email");
  } else {
    const user_id = helpers.getUserByEmail(email).id;
    req.session.user_id = userID; //set the username cookie session
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const registeredEmail = req.body.email; //get the email from req.body
  const registeredPassword = req.body.password; //get the password from req.body

  if (registeredEmail === "" || registeredPassword === "") {
    //return error if email or password are empty strings
    res.status(400).send("Please enter a valid email or password");
  } else if (helpers.getUserByEmail(registeredEmail, users)) {
    //return error if email already exists
    res.status(400).send("Email already exists");
  } else {
    const userID = generateRandomString(); //generate a random string variable of 6 characters
    users[userID] = {
      id: userID,
      email: registeredEmail,
      password: bcrypt.hashSync(registeredPassword, 10),
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null; //clear the username cookie
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
