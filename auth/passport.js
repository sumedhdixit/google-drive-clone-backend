const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('../db/database');
const User = connection.models.User;
const validPassword = require('./passwordUtils').validPassword;

const customFields = {
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
};

const verifyCallback = (req, username, password, done) => {
	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				return done(null, false);
			}

			const isValid = validPassword(password, user.hash, user.salt);

			if (isValid) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		})
		.catch((err) => {
			done(err);
		});
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

// stores the given field in session and mongodb session store.
passport.serializeUser((user, done) => {
	// user._id is same as user.id
	done(null, user.id);
});

passport.deserializeUser((userId, done) => {
	User.findById(userId)
		.then((user) => {
			done(null, user);
		})
		.catch((err) => {
			done(err);
		});
});
