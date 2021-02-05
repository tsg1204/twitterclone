const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware');

app.set('View engine', 'pug');
app.set('views', 'views');

// Routes
const loginRoute = require('./routes/loginRoutes');
app.use('/login', loginRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: 'Home',
  };

  res.status(200).render('home.pug', payload);
});

const server = app.listen(port, () => {
  console.log('Listening on port: ', port);
});
