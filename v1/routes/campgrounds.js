const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);

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
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'err.message');
		console.log(err.message);
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
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
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
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