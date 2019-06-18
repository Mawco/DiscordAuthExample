var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , Strategy = require('passport-discord').Strategy
  , app      = express()
  , path = require('path')
  , config = require("./config");
passport.serializeUser((user, done) =>{
  done(null, user);
});
passport.deserializeUser((obj, done) =>{
  done(null, obj);
});

var scopes = ['identify', 'email', 'connections', 'guilds'];

passport.use(new Strategy({
    clientID: config.AppID,
    clientSecret: config.ClientSecret,
    callbackURL: config.callbackURL,
    scope: scopes
}, (accessToken, refreshToken, profile, done) =>{
    process.nextTick(function() {
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
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth', passport.authenticate('discord', { scope: scopes }), function(req, res) {});
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/') } // auth success
);


app.get('/logout', (req, res) =>{
    req.logout();
    res.redirect('/');
});
app.get('/info', checkAuth, (req, res) =>{
    //console.log(req.user)
    res.json(req.user);
});

app.get('/', (req, res) =>{
    res.render('index', { req: req, res: res });
});

app.get('/servers', (req, res) =>{
    res.render('servers', { req: req, res: res });
});

app.get('/linkedAccounts', (req, res) =>{
    res.render('linkedAccounts', {req: req, res: res });
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}


app.listen(5000, (err) =>{
    if (err) return console.log(err)
    console.log('Listening at http://localhost:5000/')
})