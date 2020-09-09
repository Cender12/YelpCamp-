const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');




//ROOT (LANDING PAGE) ROUTE
router.get("/", function(req, res){
	res.render("landing");
});

//REGISTER FORM ROUTE
router.get('/register', function(req, res){
	res.render('register', {page: 'register'});
});

//SIGN UP LOGIC ROUTE
router.post('/register', function(req, res ){
	let newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
			if(err){
			console.log(err);
			return res.render("register", {error: err.message});
	     	}
		passport.authenticate("local")(req, res , function(){
			req.flash("success", "Welcome to YelpCamp" + user.username);	
			res.redirect("/campgrounds");
		});
	}); 
});

//LOGIN FORM ROUTE
router.get('/login', function(req, res){
	res.render('login', {page: 'register'});
});

//LOGIN FORM LOGIC ROUTE
router.post('/login', passport.authenticate("local",
		 {successRedirect: '/campgrounds',
		 failureRedirect: "/login"
		 }), function(req, res){
});


//LOGOUT ROUTE
router.get("/logout", function(req, res){
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds');
});

module.exports = router;