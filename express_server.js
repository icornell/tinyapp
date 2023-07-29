const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");// set the view engine to ejs

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

