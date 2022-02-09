const router = require('express').Router();
const passport = require('passport');
const genPassword = require('./passwordUtils').genPassword;
const connection = require('../db/database');
const isAuth = require("./verifyAuth").isAuth;
const createContainer = require("../blob_storage/storageManager").create_container;
const User = connection.models.User;

//-------------- POST ROUTES ----------------

router.post('/login', passport.authenticate("local", { failureRedirect: '/login-failure', successRedirect: '/login-success' }));

router.post('/logout', (req, res, next) => {
    req.logout();
    res.json({
        "success": true
    });
});

router.post('/register', async (req, res, next) => {
    const username = req.body.username;
    const passwordObj = genPassword(req.body.password);
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        hash: passwordObj.hash,
        salt: passwordObj.salt
    });

    const user_exists = await User.findOne({ username: username })
        .then((user) => {
            if (!user) {
                return false;
            }
            return true
        })
        .catch((err) => {
            console.log(err.message);
        });

    if (!user_exists) {
        // create container for that user
        newUser.save().
            then((user) => {
                console.log(`user created ${user}`);
                
                createContainer(req.body.username);

                res.json({
                    "success": true
                });
            }).catch(err => {
                res.json({
                    "success": false
                });
                console.log(err.message);
            });
    } else {
        res.json({
            "success": false,
            "msg": "user already exists"
        });
    }
});

//-------------- GET ROUTES ----------------

router.get('/protected-route', isAuth, (req, res, next) => {
    res.json({
        "success": true,
        "msg": "authenticated"
    });
});

router.get('/is-logged', isAuth, (req, res, next) => {
    res.json({
        "user": req.user.username,
        "email": req.user.email,
        "success": true,
    });
});

router.get('/login-success', (req, res, next) => {
    res.json({
        "user": req.user.username,
        "email": req.user.email,
        "success": true,
    });
});

router.get('/login-failure', (req, res, next) => {
    res.json({
        "success": false,
    });
});

module.exports = router;