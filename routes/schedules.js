const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');

/* GET schedules listing. */
router.get('/new', ensurer ,function(req, res, next) {
  res.render('new', { user: req.user});
});
router.get('/', function (req,res) {
  res.send('ここで予定の観覧ができるよ');
})
router.post('/', ensurer ,function (req, res, next) {
  console.log(req.body); // TODO 予定と候補を保存する関数を実装
  res.redirect('/schedules'); 
})

module.exports = router;