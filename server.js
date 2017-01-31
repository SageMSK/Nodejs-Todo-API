require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const todoRouter = require('./routes/todoRouter');
const userRouter = require('./routes/userRouter');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.use('/todos', todoRouter);
app.use('/users', userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = {app};