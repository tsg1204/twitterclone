const express = require('express');
const app = express();
const port = 3003;

app.set('View engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res, next) => {
  res.status(200).render('home.pug');
});

const server = app.listen(port, () => {
  console.log('Listening on port: ', port);
});
