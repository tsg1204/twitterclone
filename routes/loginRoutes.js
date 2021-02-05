const express = require('express');
const app = express();
const router = express.Router();

app.set('View engine', 'pug');
app.set('views', 'views');

router.get('/', (req, res, next) => {
  res.status(200).render('login.pug');
});

module.exports = router;
