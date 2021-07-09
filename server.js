const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Strategy = require('passport-discord').Strategy;
const app = express();
const path = require('path');
const config = require('./config');

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new Strategy({
  clientID: config.AppID,
  clientSecret: config.ClientSecret,
  callbackURL: config.CallbackURL,
  scope: config.scopes
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    return done(null, profile);
  });
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize(null));
app.use(passport.session(null));
app.get('/auth', passport.authenticate('discord', { scope: config.scopes }), () => null);
app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  // do something (or not)
  // (e.g: register the user in your db)
  res.redirect('/');
});


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
app.get('/info', checkAuth, (req, res) => {
  res.json(req.user);
});

app.get('/', checkAuth, (req, res) => {
  res.render('index', { req: req, res: res });
});

app.get('/servers', (req, res) => {
  res.render('servers', { req: req, res: res });
});

app.get('/connections', (req, res) => {
  res.render('connections', { req: req, res: res });
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth')
}


app.listen(3000, (err) => {
  if (err) return console.log(err)
  console.log('Listening at http://localhost:3000/');
});
