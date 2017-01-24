const express = require('express'),
      bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose'),
      Todo = require('./models/todo'),
      User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then(doc => {
    res.send(doc);
  }, err => {
    res.status(400).send(err);
  });
});

app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});

module.exports = {app};