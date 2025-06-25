const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.status(200).json({ message: 'Login erfolgreich', user: { username } });
  } else {
    res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
  }
});

module.exports = router;
