const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session"); //require cookie-session middleware
const bcrypt = require("bcryptjs"); //require bcrypt for encryption and decryption of passwords
const helpers = require("./helpers"); //require helpers.js file for modular code
const { urlDatabase, users } = require("./database"); //require database.js file for modular code

app.set("view engine", "ejs"); // set the view engine to ejs

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.send("Hello! Please login or register to use TinyApp");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: helpers.urlsForUser(req.session.user_id), //pass user's urlDatabase to templateVars
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
  const url = urlDatabase[req.params.id];
  const loggedInUser = users[req.session.user_id];
  const templateVars = {
      shortURL: req.params.id,
      longURL: url.longURL,
      user: loggedInUser,
      urls: helpers.urlsForUser(req.session.user_id),
    };
  if(!url) {
    return res.status(404).send("URL not found, please check your URL and try again");
  }
  if(url.userID !== loggedInUser.id) {//check in the logged-in user is the owner of the URL
    return res.status(403).send("You do not have permission to access to this page");
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id] ? urlDatabase[req.params.id].longURL : undefined;//checking if the longURL exists in urlDatabase and returning undefined if not
  const templateVars = {
    message: "URL not found, please check your URL and try again",
    status: 404,
  };
  if (!longURL) {
    res.render("urls_error", templateVars);
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
  const shortURL = helpers.generateRandomString(); //generate a random string variable of 6 characters
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id}; //save the longURL into urlDatabase
  if (!req.session.user_id) {
    res.send("Please login to create a new URL");
  } //only logged in users can create new URLs
  res.redirect(`/urls/${shortURL}`); //redirect to /urls/:shortURL
});

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id; //get the shortURL from url query
  if (!user) {
   return res.status(403).send("You do not have access to this page");
  }; 
  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(403).send("This URL does not belong to you **<change later>");
  };
    delete urlDatabase[shortURL]; //delete the shortURL from urlDatabase
    res.redirect("/urls"); //redirect to /urls
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id; //get the shortURL from urlDatabase
  if (!user) {
   return res.status(403).send("You do not have access to this page");
  }; 
  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(403).send("You do not have access to this page");
  };
    urlDatabase[shortURL].longURL = req.body.newURL;
     //save the newURL into urlDatabase
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //set the username cookie session
  const email = req.body.email;
  const password = req.body.password;
  const user_id = helpers.getUserByEmail(email, users)?.id;
  if (!helpers.getUserByEmail(email, users)) {
    res.status(403).send("You do not have an account with this email yet.");
  } else if (
    !bcrypt.compareSync(password, users[user_id].password)
  ) {
    //return error if password does not match
    res.status(400).send("Password does not match the provided email");
  } else {
    req.session.user_id = user_id; //set the username cookie session
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
    const userID = helpers.generateRandomString(); //generate a random string variable of 6 characters
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
