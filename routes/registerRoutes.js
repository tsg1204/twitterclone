const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');

app.set('View engine', 'pug');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {
  res.status(200).render('register.pug');
});

router.post('/', async (req, res, next) => {
  //console.log(req.body);
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password;
  const payload = req.body;

  if (firstName && lastName && username && email && password) {
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    }).catch((error) => {
      console.log(error);
      payload.erroMessage = 'Something went wrong with DB connection';
      res.status(200).render('register.pug', payload);
    });

    if (user === null) {
      const data = req.body;

      User.create(data).then((user) => {
        console.log(user);
      });
    } else {
      if (email === user.email) {
        payload.erroMessage = 'Email already in use';
      } else {
        payload.erroMessage = 'Username already in use';
      }
      res.status(200).render('register.pug', payload);
    }
  } else {
    payload.erroMessage = 'Make sure each field has a valid value';
    res.status(200).render('register.pug', payload);
  }
});

module.exports = router;
