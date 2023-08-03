const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser"); //require cookie-parser

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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
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
};

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
    urls: urlDatabase, //pass urlDatabase to templateVars
    user: users[req.cookies["user_id"]], //pass username to templateVars
  };
  res.render("urls_index", templateVars); // pass templateVars to urls_index.ejs
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; //get the longURL from urlDatabase
  console.log(longURL); //see the longURL
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    email: req.body.email,
    password: req.body.password,
  };
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); //generate a random string variable of 6 characters
  urlDatabase[generateRandomString()] = req.body.longURL; //save the longURL into urlDatabase
  console.log(urlDatabase); //see the new urlDatabase
  res.redirect(`/urls/${shortURL}`); //redirect to /urls/:shortURL
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; //delete the longURL from urlDatabase
  console.log(urlDatabase); //see the new urlDatabase
  res.redirect("/urls"); //redirect to /urls
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; //get the shortURL from urlDatabase
  urlDatabase[shortURL] = req.body.newURL; //save the newURL into urlDatabase
  console.log(urlDatabase); //see the new urlDatabase
  res.redirect("/urls"); //redirect to /urls
});

app.post("/login", (req, res) => {
  //set the username cookie
  const user_id = req.body.user_id; //get the username from req.body
  res.cookie("user_id", user_id); //set the username cookie
  res.redirect("/urls"); //redirect to /urls
});

app.post("/logout", (req, res) => {
  //clear the username cookie
  res.clearCookie("user_id"); //clear the username cookie
  res.redirect("/urls"); //redirect to /urls
});

app.post("/register", (req, res) => {
  const registeredEmail = req.body.email; //get the email from req.body
  const registeredPassword = req.body.password; //get the password from req.body

  if (registeredEmail === "" || registeredPassword === "") {//return error if email or password are empty strings
    res.status(400).send("Please enter a valid email or password");
  } else if(getUserByEmailUserByEmail(registeredEmail)) {//return error if email already exists
    res.status(400).send("Email already exists");
  } else {
    const userID = generateRandomString(); //generate a random string variable of 6 characters
    users[userID] = {
      id: userID,
      email: registeredEmail,
      password: registeredPassword,
    };
    console.log(users); //see the new users
  };
  res.cookie("user_id", userID); //set the user_id cookie
  res.redirect("/urls"); //redirect to /urls
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
