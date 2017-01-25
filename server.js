const express = require('express'),
      bodyParser = require('body-parser'),
      { ObjectID } = require('mongodb');

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

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({ todos });
  }, err => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  Todo.findById(id).then(todo => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch(err => {
    res.status(400).send();
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = {app};