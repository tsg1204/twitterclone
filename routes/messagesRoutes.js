const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const Chat = require('../schemas/ChatSchema');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
  res.status(200).render('inboxPage.pug', {
    pageTitle: 'Inbox',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});

router.get('/new', (req, res, next) => {
  res.status(200).render('newMessagePage.pug', {
    pageTitle: 'New Message',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});

router.get('/:chatId', async (req, res, next) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;
  const isValidId = mongoose.isValidObjectId(chatId);
  const payload = {
    pageTitle: 'Chat',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  if (!isValidId) {
    payload.errorMessage =
      'Chat does not exist or you do not havae permission ot view it.';
    return res.status(200).render('chatPage.pug', payload);
  }
  let chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate('users');

  if (chat === null) {
    const userFound = User.findById(chatId);

    if (userFound != null) {
      chat = await getChatByUserId(userFound._id, userId);
    }
  }

  if (chat === null) {
    payload.errorMessage =
      'Chat does not exist or you do not havae permission ot view it.';
  } else {
    payload.chat = chat;
  }

  res.status(200).render('chatPage.pug', payload);
});

const getChatByUserId = (userLoggedInId, otherUserId) => {
  return Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedInId, otherUserId],
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).populate('users');
};

module.exports = router;
