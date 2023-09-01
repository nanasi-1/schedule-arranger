const express = require('express');
const router = express.Router();

/* GET schedules listing. */
router.get('/', function(req, res, next) {
  res.send('ここは予定表示ページ。');
});

module.exports = router;