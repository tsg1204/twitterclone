const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const Messages = require('../../schemas/MessageSchema');
const Chat = require('../../schemas/ChatSchema');
const User = require('../../schemas/UserSchema');
const Notification = require('../../schemas/NotificationSchema');

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

      const chat = await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      }).catch((error) => console.log(error));

      insertNotification(chat, message);

      res.status(201).send(message);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

const insertNotification = (chat, message) => {
  chat.users.forEach((userId) => {
    if (userId === message.sender._id.toString()) return;

    Notification.insertNotification(
      userId,
      message.sender._id,
      'newMessage',
      message.chat._id
    );
  });
};

module.exports = router;
