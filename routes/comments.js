const express = require('express');
const router = express.Router();

/* GET comments listing. */
router.get('/', function(req, res, next) {
  res.send('ここはコメント処理ページ。');
});

module.exports = router;