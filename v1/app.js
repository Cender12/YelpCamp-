//REQUIRING PACKAGES
const express    = require('express');
const app        = express();
const bodyParser = require("body-parser");
const Campground = require("./models/campground")
const Comment    = require("./models/comment")
const seedDB     = require("./seeds")
const passport   = require('passport')
LocalStrategy    = require('passport-local')
User             = require('./models/user')
methodOverride   = require('method-override')
flash            = require('connect-flash')


//REQUIRING ROUTES
const commentRoutes    = require('./routes/comments'),
	  campgroundRoutes = require('./routes/campgrounds'),
	  authRoutes       = require('./routes/index');



//this connects mongoose so we can connect our JS code to MongoDBB
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Enderc:Ender5541!@cluster0.mhgn9.mongodb.net/<dbname>?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', "ejs");

// This serves everything in the "public directory"
app.use(express.static(__dirname + "/public"));

app.use(methodOverride('_method'));
//this seeds the database
// seedDB();
app.use(flash());

//PASSPORT CONFIG
app.use(require('express-session')({
	secret: "I love sugar",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});


//Requires our 3 route files
app.use('/', authRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);


//PORT listen
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});