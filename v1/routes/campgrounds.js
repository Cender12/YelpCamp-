const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

//INDEX ROUTE - (SHOWS ALL CAMPGROUNDS)
router.get("/", function(req, res){
	//retrieves all campgrounds from DB and shows them
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			//this code sends all the campgrounds that came back and send to campgroudns.ejs file
			res.render("campgrounds/Index.ejs", {campgrounds:allCampgrounds, page: 'campgrounds'});
		}
	});
});


//CREATE ROUTE - (ADDS NEW CAMPGROUND TO DB)
//Campgrounds POST route (takes data from GET form, does something with it and then redirect  it to "/campgrounds" as a GET)
router.post("/", middleware.isLoggedIn, function(req, res){
	//get data from form and add to campgrounds DB
	let name = req.body.name
	let price = req.body.price
	let image = req.body.image
	let desc = req.body.description
	let author = {
		id: req.user._id,
		username: req.user.username
	}
	//this creates a new object(from info above) as a seperate step
	let newCampground = {name: name, price: price, image: image, description: desc, author: author}
    //create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
				//redirect back to campgrounds page with newly added data
			console.log('newlyCreated')
			res.redirect("/campgrounds");
		}
	});
});


//NEW ROUTE- (SHOWS FORM TO CREATE NEW CAMPGROUND)
//new campground GET route
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new.ejs");
});


//SHOW ROUTE - (SHOWS MORE INFO ABOUT ONE SPECIFIC CAMPGROUND)
//This needs to be declared after "campgrounds/new" to avoid issues with url
router.get("/:id", function(req, res){
	//find campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Campground not found');
			res.redirect('back')
		} else {
			console.log(foundCampground);
			//render show template with that campground
			res.render("campgrounds/show.ejs", {campground: foundCampground});
		}										 
	});
})

//EDIT campground route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
			Campground.findById(req.params.id, function(err, foundCampground){
			res.render('campgrounds/edit', {campground: foundCampground});	
			});
		});

//UPDATE campground route
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect('/campgrounds');
		} else{
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
	//redirect somewhere(show page)
});

//DESTROY campground route
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect('/campgrounds');
		} else{
			res.redirect('/campgrounds');
		}
	});
});


module.exports = router;