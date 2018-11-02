var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');

var User = require('../models/user');
router.use(csrfProtection);

router.get('/logout', (req, res, next)=>{
  req.logout();
  res.redirect('/');
});

router.get('/profile',isloggedIn, (req, res, next)=>{
  res.render('user/profile', {user: req.user});
});

router.use('/',notloggedIn, (req, res, next)=>{
  next();
})
//sign up route
router.get('/signup', (req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/signup', {token: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
  });
  
  router.post('/signup', passport.authenticate('local.signup',{
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
  }));



  router.get('/signin', (req,res,next)=>{
    var messages = req.flash('error');
    res.render('user/signin', {token: req.csrfToken(), messages: messages, hasErrors: messages.length >0});
  });
  
  router.post('/signin', notloggedIn , passport.authenticate('local.signin',{
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
  }));
  

  function isloggedIn(req, res, next){
      if(req.isAuthenticated()){
        return next();
      }
      res.redirect('/');
  }

  function notloggedIn(req, res, next){
    if(!req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
}



module.exports = router;
  