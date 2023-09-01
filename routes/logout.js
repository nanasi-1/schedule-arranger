const express = require('express');
const router = express.Router();

/* GET logout listing. */
router.get('/', function(req, res, next) {
  if (req.user) {
    req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
  }else {
    res.send('ここはログアウトページ。');
  }
});

module.exports = router;