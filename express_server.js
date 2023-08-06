const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser"); //require cookie-parser
const bcrypt = require("bcryptjs"); //require bcrypt

app.set("view engine", "ejs"); // set the view engine to ejs
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //use cookie-parser as per the documentation

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

const getUserByEmail = (email) => {
  ///DRY code to find a user by email
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = (id) => {
  //DRY code to find a user by id
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

const urlDatabase = {};
/* 
  urlDatabase object with shortURL as key and longURL as value and userID as the user that created the URL
  'b2xVn2' : { 
    longURL: "http://www.lighthouselabs.ca", 
    userID: "userRandomID" 
  },
  '9sm5xK' : {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
  */

const users = {};
/*
  userRandomID: {
    id: "userRandomID",
    email: "user@email.com",
    password: "secure-password",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@email.com",
    password: "secure-password2",
  },
  */

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]), //pass user's urlDatabase to templateVars
    user: users[req.cookies["user_id"]], //pass username to templateVars
  };
  res.render("urls_index", templateVars); // pass templateVars to urls_index.ejs
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (templateVars.user) {
    //only logged in users can create new URLs
    res.render("urls_new", templateVars);
    res.redirect("/login");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userID: users[req.cookies["user_id"]],
      userURLs: urlsForUser(req.cookies["user_id"]),
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
    user: users[req.cookies["user_id"]],
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
    user: users[req.cookies["user_id"]],
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
  console.log(urlDatabase); //see the new urlDatabase
  if (!req.cookies["user_id"]) {
    res.send("Please login to create a new URL");
  } //only logged in users can create new URLs
  res.redirect(`/urls/${shortURL}`); //redirect to /urls/:shortURL
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = users[req.cookies["user_id"]];
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
  const userID = users[req.cookies["user_id"]];
  const userURLs = urlsForUser(userID);
  if (!userURLs[req.params.id] || !userID) {
    res.status(403).send("You do not have access to this page");
  } //only logged in users can edit their own URLs
  else {
    const shortURL = req.params.id; //get the shortURL from urlDatabase
    urlDatabase[shortURL] = req.body.newURL; //save the newURL into urlDatabase
    console.log(urlDatabase); //see the new urlDatabase
    res.redirect("/urls"); //redirect to /urls
  }
});

app.post("/login", (req, res) => {
  //set the username cookie
  const email = req.body.email;
  const password = req.body.password;

  if (!getUserByEmail(email)) {
    res.status(403).send("Email not found");
  } else if (getUserByEmail(email).password !== password) {
    res.status(403).send("Password incorrect");
  } else if (
    !bcrypt.compareSync(registeredPassword, users[registeredEmail].password)
  ) {
    //return error if password does not match
    res.status(400).send("Password does not match the provided email");
  } else {
    const user_id = getUserByEmail(email).id;
    res.cookie("user_id", user_id); //set the username cookie
    res.redirect("/urls"); //redirect to /urls
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); //clear the username cookie
  res.redirect("/login"); //redirect to /login
});

app.post("/register", (req, res) => {
  const registeredEmail = req.body.email; //get the email from req.body
  const registeredPassword = req.body.password; //get the password from req.body

  if (registeredEmail === "" || registeredPassword === "") {
    //return error if email or password are empty strings
    res.status(400).send("Please enter a valid email or password");
  } else if (getUserByEmail(registeredEmail)) {
    //return error if email already exists
    res.status(400).send("Email already exists");
  } else {
    const userID = generateRandomString(); //generate a random string variable of 6 characters
    users[userID] = {
      id: userID,
      email: registeredEmail,
      password: bcrypt.hashSync(registeredPassword, 10),
    };
    res.cookie("user_id", userID); //set the user_id cookie
    res.redirect("/urls"); //redirect to /urls
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
