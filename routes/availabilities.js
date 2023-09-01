const express = require('express');
const router = express.Router();

/* GET availabilities listing. */
router.get('/', function(req, res, next) {
  res.send('ここは出欠確認処理ページ。');
});

module.exports = router;