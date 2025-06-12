const express = require('express');
const loginRouter = require('./routes/login.cjs');

const app = express();

const filePath = path.resolve(__dirname, "data", "absences.json");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test-Route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Login-Router
app.use('/login', loginRouter);

module.exports = app;
