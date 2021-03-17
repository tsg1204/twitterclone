const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoDB = require('./database');
const session = require('express-session');
const sessionSecret = require('./dev/keys');

const server = app.listen(port, () => {
  console.log('Listening on port: ', port);
});

const io = require('socket.io')(server, { pingTimeout: 60000 });

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
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationRoute = require('./routes/notificationRoutes');

//API routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);
app.use('/post', middleware.requireLogin, postRoute);
app.use('/profile', middleware.requireLogin, profileRoute);
app.use('/uploads', uploadRoute);
app.use('/search', middleware.requireLogin, searchRoute);
app.use('/messages', middleware.requireLogin, messagesRoute);
app.use('/notifications', middleware.requireLogin, notificationRoute);

app.use('/api/posts', postsApiRoute);
app.use('/api/users', usersApiRoute);
app.use('/api/chats', chatsApiRoute);
app.use('/api/messages', messagesApiRoute);
app.use('/api/notifications', notificationsApiRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: 'Home',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render('home.pug', payload);
});

//client socket connection
io.on('connection', (socket) => {
  //console.log('connected to socket io');
  socket.on('setup', (userData) => {
    //console.log(userData.firstName);
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join room', (room) => socket.join(room));
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  socket.on('notification received', (room) =>
    socket.in(room).emit('notification received')
  );

  socket.on('new message', (newMessage) => {
    const chat = newMessage.chat;

    if (!chat.users) return console.log('Chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;

      socket.in(user._id).emit('message received', newMessage);
    });
  });
});
