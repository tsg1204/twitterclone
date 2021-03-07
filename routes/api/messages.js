const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const Messages = require('../../schemas/MessageSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/', async (req, res, next) => {
  if (!req.body.content || !req.body.chatId) {
    console.log('Invalid data passed into request');
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId,
  };

  Messages.create(newMessage)
    .then((results) => res.status(201).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = router;
