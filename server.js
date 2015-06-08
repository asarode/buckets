/* ====================
         MODULES
   ==================== */
var express = require("express")
  , bodyParser = require("body-parser")
  , mongoose = require("mongoose")
  , passport = require('passport')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , GitHubStrategy = require('passport-github2').Strategy
  , oauth = require('./config/oauth')
  , appSecret = require('./config/secret').secret;


var app = express();
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(express.static(__dirname + "/public"));
	app.use(cookieParser());
	app.use(session({ 
		secret: appSecret,
		resave: false,
		saveUninitialized: false 
	}));
  	app.use(passport.initialize());
  	app.use(passport.session());

	app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
		next();
	});

/* ====================
          MODELS
   ==================== */
var User = require("./app/models/users")
  , Bucket = require("./app/models/buckets");

/* ====================
          ROUTES
   ==================== */

function ensureAuth(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/#/login');
}

// PASSPORT
passport.use(new GitHubStrategy({
		clientID: oauth.githubAuth.clientId,
		clientSecret: oauth.githubAuth.clientSecret,
		callbackURL: oauth.githubAuth.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
		User.findOrCreate({ githubId: profile.id }, function(err, user) {
			return done(err, user);
		});
	}
));

app.get('/auth/github', 
	passport.authenticate('github', { scope: [ 'user:email' ] })
)

app.get('/auth/github/callback',
	passport.authenticate('github', { failureRedirect: '/login' }),
	function(req, res) {
		// Successful authentication. Redirect to home.
		res.redirect('/');
	}
);

app.get('/me', ensureAuth, function(req, res) {
	res.json(req.user);
});

app.get('/buckets', function(req, res) {
	Bucket.find().sort('-createdAt').exec(function(err, data) {
		if (err) res.send(err);
		res.json(data);
	});
});

app.get('buckets/:bucketId', function(req, res) {
	Bucket.findById(req.params.bucketId, function(err, bucket) {
		if (err) res.send(err);
		res.json(bucket);
	});
});

app.get('/buckets/create', ensureAuth, function(req, res) {
	res.render('create');
});

app.post('/buckets', function(req, res) {
	var bucket = new Bucket();

	bucket.title = req.body.title;
	bucket.level = req.body.level;
	bucket.links = req.body.links;
	bucket.author = req.body.author;
	bucket.ownerId = req.body.ownerId;
	bucket.stargazers = [];

	bucket.save(function(err) {
		if (err) res.send(err);
		else {
			User.update(
				{ _id: req.body.ownerId },
				{ $push: { buckets: bucket._id } }
			).exec();
			res.send({ message: 'Created bucket.' });
		}
	});
});

app.put('/buckets/:bucketId/star', function(req, res) {
	Bucket.findById(req.params.bucketId, function(err, bucket) {
		if (err) res.send(err);

		if (bucket.stargazers.indexOf(req.body.userId) < 0) {
			bucket.stargazers.push(req.body.userId);

			User.update(
				{ _id: req.body.userId },
				{ $push: { stargazing: req.params.bucketId } }
			, function(err, raw) {
				if (err) res.send(err);
				bucket.save(function(err) {
					if (err) res.send(err);
					res.json({ 
						message: 'Bucket starred.', 
						bucket: bucket
					});
				});
			});
		} else {
			var index = bucket.stargazers.indexOf(req.body.userId);
			bucket.stargazers.splice(index, 1);

			User.update(
				{ _id: req.body.userId },
				{ $pull: { stargazing: req.params.bucketId } }
			, function(err, raw) {
				if (err) res.send(err);
				bucket.save(function(err) {
					if (err) res.send(err);
					res.json({
						message: 'Bucket unstarred.',
						bucket: bucket
					});
				});
			});
		}
	});
});

app.delete('buckets/:bucketId', function(req, res) {
	Bucket.remove({ _id: req.params.bucketId }, function(err, bucket) {
		if (err) res.send(err);
		res.send({ message: 'Bucket deleted.' });
	});
});

app.get('/users', function(req, res) {
	User.find(function(err, data) {
		if (err) res.send(err);
		res.json(data);
	});
});

app.get('users/:userId', function(req, res) {
	User.findById(req.params.userId, function(err, user) {
		if (err) res.send(err);
		res.json(user);
	});
});

app.post('/users', function(req, res) {
	var user = new User();

	user.oauthId = 'temp',
	user.name = req.body.name;
	user.avatarURL = 'temp',
	user.profileURL = 'temp',
	user.stargazing = [];
	user.buckets = [];	

	user.save(function(err) {
		if (err) res.send(err);
		res.json({ message: 'Created user.' });
	});
});

app.delete('users/:userId', function(req, res) {
	User.remove({ _id: req.params.userId }, function(err, user) {
		if (err) res.send(err);
		res.json({ message: 'User deleted.' });
	});
});

/* ====================
         DATABASE
   ==================== */
var db = require('./config/database');
mongoose.connect(db.url, function(err, database) {
	if (err) console.log(err);
	else console.log('Connected to database.');
});

/* ====================
        START APP
   ==================== */
app.set('port', (process.env.PORT || 5000));
var server = app.listen(app.get('port'), function() {
	var port = app.get('port');
	console.log('LearnBuckets app listening on port %s', port);
});



