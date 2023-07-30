const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");// set the view engine to ejs
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };// pass urlDatabase to templateVars
  res.render("urls_index", templateVars);// pass templateVars to urls_index.ejs
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };// pass urlDatabase to templateVars
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];//get the longURL from urlDatabase
  console.log(longURL);//see the longURL
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();//generate a random string variable of 6 characters
  urlDatabase[generateRandomString()] = req.body.longURL;//save the longURL into urlDatabase 
  console.log(urlDatabase);//see the new urlDatabase
  res.redirect(`/urls/${shortURL}`);//redirect to /urls/:shortURL
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];//delete the longURL from urlDatabase
  console.log(urlDatabase);//see the new urlDatabase
  res.redirect("/urls");//redirect to /urls
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
