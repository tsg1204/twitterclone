const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoDB = require('./database');
const session = require('express-session');
const sessionSecret = require('./dev/keys');

mongoDB.connectDB();

app.set('View engine', 'pug');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: sessionSecret.sessionSecret,
    resave: true,
    saveUninitialized: false,
  })
);

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');

//API routes
const postsApiRoute = require('./routes/api/posts');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);

app.use('/api/posts', postsApiRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: 'Home',
    userLoggedIn: req.session.user,
  };

  res.status(200).render('home.pug', payload);
});

const server = app.listen(port, () => {
  console.log('Listening on port: ', port);
});
