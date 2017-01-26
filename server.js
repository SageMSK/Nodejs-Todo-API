require('./config.js');
const express = require('express'),
      bodyParser = require('body-parser'),
      _ = require('lodash'),
      { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose'),
      Todo = require('./models/todo'),
      User = require('./models/user'),
      authenticate = require('./middleware/authenticate');

const app = express();
const PORT = process.env.PORT;
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

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then(todo => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch(err => {
    res.status(400).send();
  });

});

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch(e => res.status(400).send());

});

// ============================= //
// ============================= //
// ============================= //

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let newUser = new User(body);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then(token => {
    res.header('x-auth', token).send(newUser);
  }).catch(e => res.status(400).send(e));
});

app.get('/users', (req, res) => {
  User.find().then(users => {
    res.send({users});
  }).catch(e => res.status(400).send());
});

app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = {app};