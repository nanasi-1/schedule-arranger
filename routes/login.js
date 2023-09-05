const express = require('express');
const router = express.Router();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/* GET login listing. */
router.get('/', function(req, res, next) {
  res.render('login', {user: req.user});
});

/*router.post('/auth', function(req, res) {
  console.log(req.body); // req.bodyでPOSTされた内容を受け取れる
  res.redirect('/login/success'); // ルートディレクトリからのパスを書く
})*/

router.get('/success', function (req, res) {
  res.send(req.user + 'でのログインに成功しました');
})
router.get('/failure', function (req,res) {
  res.send('認証に失敗しました');
})

module.exports = router;