const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const Messages = require('../../schemas/MessageSchema');
const Chat = require('../../schemas/ChatSchema');
const User = require('../../schemas/UserSchema');

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
    .then(async (message) => {
      message = await message.populate('sender').execPopulate();
      message = await message.populate('chat').execPopulate();
      message = await User.populate(message, { path: 'chat.users' });

      Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      }).catch((error) => console.log(error));

      res.status(201).send(message);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = router;
