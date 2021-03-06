const LocalAuth = require('../auth/local_auth');
const router = require('express').Router();

router.post('/signup', LocalAuth.signup);

router.post('/local-signup', LocalAuth.signup);

router.post('/signin', LocalAuth.signin);

router.get('/refresh' ,(req,res,next) => {res.json({poop:"hello"})});

module.exports = router;