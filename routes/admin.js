var express = require('express');
var router = express.Router();

var passport = require('passport');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './uploads/');
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString() + file.originalname);
    }
})
var upload = multer({storage});
var csrf = require('csurf');
var csrfProtection = csrf();
var ObjectID = require('mongodb').ObjectID;

var Admin = require('../models/admin');
var Product = require('../models/product');
var User = require('../models/user');

router.post('/add-product',isloggedIn, upload.single('imagePath'), (req, res, next)=>{
    console.log(req.file);
    const product = new Product({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        imagePath: req.file.path
    });
    product.save().then((doc)=>{
        console.log('Product added');
    }, (e)=>{
        console.log(e);
    });
    res.redirect('/');
});

router.post('/edit/:id',upload.single('imagePath'),  isloggedIn, (req, res, next) =>{
    const query = {_id : req.params.id}
    Product.findOne(query, (err, doc) =>{
      if(err){
        return console.log(err);
      }
      doc.title = req.body.title;
      doc.description = req.body.description;
      doc.price = req.body.price;
      doc.imagePath = req.file.path
      doc.save();
      console.log('Product updated...');
      res.redirect('/admin/manage-product');
    });
  });

router.use(csrfProtection);

router.get('/admin-login', (req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/admin', {token: req.csrfToken(), messages: messages, hasErrors: messages.length >0});
});


router.post('/admin-login', passport.authenticate('local.admin',{
    successRedirect: '/user/profile',
    failureRedirect: '/admin/admin-login',
    failureFlash: true
}));

router.get('/add-product', isloggedIn,  (req, res, next)=>{
    res.render('shop/add-product', {token: req.csrfToken()});
});

router.get('/manage-product', isloggedIn,  (req, res, next)=>{
    Product.find((err, docs)=>{
        res.render('shop/manage-product', { title: 'EKart', products: docs});
    })  
});

router.get('/manage-users',isloggedIn, (req, res, next)=>{
    User.find((err, user)=>{
        res.render('shop/manage-user', {user: user});
    })
});

router.get('/edit/:id', isloggedIn,  (req, res, next)=>{
    const q = {_id: req.params.id}
    Product.findById(q, (err, doc)=>{
        if(err){
        return console.log(err);
        }
        console.log(doc);
        res.render('shop/edit', {
            doc: doc,
            token: req.csrfToken()
        });
    });
});

router.get('/delete/:id', isloggedIn, (req, res, next)=>{
    const query = {_id: req.params.id}
    if(!ObjectID.isValid(req.params.id)){
      return res.render('error', {message: "Error didn't found the given id"});
    }
    Product.findOneAndRemove({_id: query}).then((product)=>{
      if(!product){
        return res.status(400).send();
      }
      console.log('Product removed');
      res.redirect('/admin/manage-product');
    }).catch((e)=>{
      res.status(400).send();
    });
});



//deleting users route
router.get('/delete/user/:id', isloggedIn, (req, res, next)=>{
    const query = {_id: req.params.id}
    if(!ObjectID.isValid(req.params.id)){
      return res.render('error', {message: "Error didn't found the given id"});
    }
    User.findOneAndRemove({_id: query}).then((product)=>{
      if(!product){
        return res.status(400).send();
      }
      console.log('User removed');
      res.redirect('/admin/manage-users');
    }).catch((e)=>{
      res.status(400).send();
    });
});

function isloggedIn(req, res, next){
        if(req.isAuthenticated() && req.user.isAdmin === true){
            return next();
        }
        res.redirect('/');
}

module.exports = router;
