const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) => {
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };

  res.status(200).render('profilePage.pug', payload);
});

router.get('/:username', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  //console.log('Payload: ', payload);

  res.status(200).render('profilePage.pug', payload);
});

router.get('/:username/replies', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  //console.log('Payload: ', payload);
  payload.selectedTab = 'replies';

  res.status(200).render('profilePage.pug', payload);
});

router.get('/:username/following', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  //console.log('Payload: ', payload);
  payload.selectedTab = 'following';

  res.status(200).render('followersAndFollowing.pug', payload);
});

router.get('/:username/followers', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  //console.log('Payload: ', payload);
  payload.selectedTab = 'followers';

  res.status(200).render('followersAndFollowing.pug', payload);
});

const getPayload = async (username, userLoggedIn) => {
  let user = await User.findOne({ username: username });

  if (user === null) {
    user = await User.findById(username);

    if (user === null) {
      return {
        pageTitle: 'User not found',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.username,
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
};

module.exports = router;
