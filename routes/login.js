const express = require('express');
const router = express.Router();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/* GET login listing. */
router.get('/', function(req, res, next) {
  console.log(req.user + 'req.user');
  res.render('login', {user: req.user});
});

router.post('/auth', function(req, res) {
  console.log(req.body); // req.bodyでPOSTされた内容を受け取れる
  res.send('OK');
})

module.exports = router;