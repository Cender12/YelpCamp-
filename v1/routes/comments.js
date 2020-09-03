const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

//COMMENTS - NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log
		} else {
			res.render("comments/new", {campground: campground});
		}
	})
});

//COMMENTS - CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
			res.redirect("/campgrounds");
		} else{
			Comment.create(req.body.comment, function (err, comment){
				if(err){
					req.flash("error", "Something went wrong");
					console.log(err)
				} else{
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					req.flash("success", "Succesfully added comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
	//STEPS ABOVE
	//lookup campgrounds using ID
	//create new comments
	//connect new comment to campgrounds
	// redirect campground show page
});

// COMMENT EDIT ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'No campground found');
			return res.redirect('back');
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect('back');
			} else{
				res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
			}
	});
  });
});


// COMMENT UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect('back');
		} else{
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//COMMENTS DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership,  function(req, res){
	//findByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect('back');
		} else{
			//sends success message
			req.flash("success", "Comment deleted");
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});


//MIDDLEWARE
//Look at ----> Middleware/index.js folder


module.exports = router;