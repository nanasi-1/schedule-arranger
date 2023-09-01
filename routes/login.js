const express = require('express');
const router = express.Router();

/* GET login listing. */
router.get('/', function(req, res, next) {
  res.send('ここはログインページ。');
});

module.exports = router;