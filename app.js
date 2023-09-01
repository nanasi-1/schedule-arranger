// モジュールの読み込み
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// ルーターの読み込み
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const shedRouter = require('./routes/schedules');
const availRouter = require('./routes/availabilities');
const commentsRouter = require('./routes/comments');

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
}));

// ルーター一覧
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/schedules', shedRouter);
app.use('/availabilities', availRouter);
app.use('/comments', commentsRouter);

// ここからログイン関係
const users = [ // ユーザーデータ
  { username: 'alice', password: 'alice' },
  { username: 'bob', password: 'bob'},
  { username: 'carol', password: 'carol' },
  { username: 'Taro', password: 'Taro123'}
]

const User = {
  findOne({ username }) {
    return users.find(user => user.username === username) || null
  }
}

passport.use(new LocalStrategy(
  {usernameField: "username", passwordField: "password"},
  (username, password, done) => {
    const user = User.findOne({ username })
    if (user == null) {
      return done(null, false)
    }
    if (user.password !== password) {
      return done(null, false)
    }
    delete user.password
    return done(null, user)
  }
))

app.post(
  '/login/auth',
  passport.authenticate('local',
    {
      failureRedirect : '/failure',
      successRedirect : '/login'
    }
  )
)

passport.serializeUser(function(user, done) {
  console.log('シリアライズ中...');
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  console.log('デシリアライズ中...');
  const user = User.findOne({ username });
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
