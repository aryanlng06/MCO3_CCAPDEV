const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'handlebars');
server.engine('handlebars', handlebars.engine({
    extname: 'handlebars',
}));

server.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/users'); //make a schema named users you can change the name

server.use(express.static('public'));

const session = require('express-session');

server.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to false if not using HTTPS
}));

const userSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password1: { type: String },
    imageSrc: { type: String, default: "https://speaking.com/wp-content/uploads/2023/09/gordon_ramsay.jpg" },
    bio: { type: String, default: "Add a Bio?" },
    numOfRev: { type: String, default: "1" },
    numOfKitch: { type: String, default: "1" }
}, { versionKey: false });

const userModel = mongoose.model('user', userSchema);

const kitchenSchema = new mongoose.Schema({
    restaurantName: { type: String }
}, { versionKey: false });

const kitchenModel = mongoose.model('kitchen', kitchenSchema);

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to the user schema
    imageSrc: { type: String },
    username: { type: String },
    restaurantName: { type: String },
    location: { type: String },
    rating: { type: String },
    ratingImageSrc: { type: String },
    description: { type: String }
}, { versionKey: false });

const postModel = mongoose.model('post', postSchema);


function errorFn(err){
    console.log('Error found. Please trace!');
    console.error(err);
}

const bcrypt = require('bcrypt');

server.post('/register', async function(req, resp){
    const { username, email, password1 } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password1, 10);

        const userInstance = new userModel({
            username: username,
            email: email,
            password1: hashedPassword, // Save hashed password to the database
            imageSrc: "https://speaking.com/wp-content/uploads/2023/09/gordon_ramsay.jpg",
            bio: "Add a Bio?",
            numOfRev: "1",
            numOfKitch: "1"
        });

        // Save user instance to the database
        await userInstance.save();

        resp.redirect('/');
    } catch (err) {
        errorFn(err);
        resp.redirect('/Registration_page.handlebars'); // Redirect back to registration page on error
    }
});

server.post('/login', async function(req, resp){
    const { email, password1 } = req.body;

    try {
        // Find user by email
        const user = await userModel.findOne({ email: email });

        if (user) {
            // Compare passwords
            const match = await bcrypt.compare(password1, user.password1);

            if (match) {
                const username = user.username;

                // Set session data
                req.session.user = {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    imageSrc: user.imageSrc,
                    bio: user.bio,
                    numOfRev: user.numOfRev,
                    numOfKitch: user.numOfKitch
                    // Add any other user-related data you want to store in the session
                }; 

                resp.redirect('/Home_page.handlebars');
            } else {
                resp.redirect('/'); // Redirect to login page with login failure indicator
            }
        } else {
            resp.redirect('/'); // Redirect to login page with login failure indicator
        }
    } catch (err) {
        console.error(err);
        resp.redirect('/login?loginFailed=true'); // Redirect to login page with login failure indicator
    }
});

server.post('/admin_login', async function(req, resp){
    const { email, password1 } = req.body;

    try {
        // Check if the email and password match the pre-defined values
        if (email === 'admin@example.com' && password1 === 'adminpassword') {
            // Set session data (if needed)
            req.session.user = {
                email: email
            }; 
            resp.redirect('/admin_page.handlebars'); // Redirect to the admin page
        } else {
            resp.redirect('/admin_login.handlebars'); // Redirect to login page with login failure indicator
        }
    } catch (err) {
        console.error(err);
        resp.redirect('/login?loginFailed=true'); // Redirect to login page with login failure indicator
    }
});

server.get('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.error(err);
        } else {
            res.redirect('/'); // Redirect to login page after logout
        }
    });
});

server.post('/addRest', function(req, resp){
    const kitchenInstance = new kitchenModel({
        restaurantName: req.body.restaurantName
    });

    kitchenInstance.save()
      .then(() => {
        resp.redirect('/Home_page.handlebars'); // Redirect to the login page after successful registration
      })
      .catch(err => {
        errorFn(err);
        resp.redirect('/Home_page.handlebars'); // Redirect back to registration page on error
      });
});

server.post('/addRestAdmin', function(req, resp){
    const kitchenInstance = new kitchenModel({
        restaurantName: req.body.restaurantName
    });

    kitchenInstance.save()
      .then(() => {
        resp.redirect('/manage_resto.handlebars'); // Redirect to the login page after successful registration
      })
      .catch(err => {
        errorFn(err);
        resp.redirect('/manage_resto.handlebars'); // Redirect back to registration page on error
      });
});

server.post('/postReview', function(req, resp) {
    const { restaurantName, location, rating, description } = req.body;
    const userId = req.session.user ? req.session.user._id : null; // Get user's _id from session
    const username = req.session.user ? req.session.user.username : null; // Get user's username from session
    const imageSrc = req.session.user ? req.session.user.imageSrc : null; // Get user's imageSrc from session

    const postInstance = new postModel({
        userId: userId,
        imageSrc: imageSrc,
        username: username,
        restaurantName: restaurantName,
        location: location,
        rating: rating,
        ratingImageSrc: "https://img.freepik.com/free-vector/3d-metal-star-isolated_1308-115283.jpg",
        description: description
    });

    postInstance.save()
        .then(() => {
            resp.redirect('/Home_page.handlebars'); // Redirect after successful registration
        })
        .catch(err => {
            errorFn(err);
            resp.redirect('/Home_page.handlebars'); // Redirect back to registration page on error
        });
});


// POST route to delete a post
server.post('/deletePost', function(req, res) {
    const postId = req.body.postId; // Assuming postId is sent in the request body
    const userId = req.session.user ? req.session.user._id : null; // Get user's _id from session

    // Find the post by postId
    postModel.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).send('Post not found');
            }
            // Check if the user is the author of the post
            if (post.userId.toString() !== userId) {
                return res.status(403).send('You are not authorized to delete this post');
            }
            // If user is authorized, proceed to delete the post
            postModel.findByIdAndDelete(postId)
                .then(() => {
                    res.redirect('/Home_page.handlebars'); // Redirect after successful deletion
                })
                .catch(err => {
                    console.error(err);
                    res.redirect('/Home_page.handlebars'); // Redirect back to home page on error
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

server.post('/deletePostAdmin', function(req, res) {
    const postId = req.body.postId; // Assuming postId is sent in the request body
    postModel.findByIdAndDelete(postId)
        .then(() => {
            res.redirect('/manage_posts.handlebars'); // Redirect after successful deletion
        })
        .catch(err => {
            console.error(err);
            res.redirect('/manage_posts.handlebars'); // Redirect back to home page on error
        });
});

server.post('/deleteUserAdmin', function(req, res) {
    const userId = req.body.userId;

    // Delete the user
    userModel.findByIdAndDelete(userId)
        .then(() => {
            // Delete all posts associated with the deleted user
            return postModel.deleteMany({ userId: userId });
        })
        .then(() => {
            res.redirect('/manage_users.handlebars'); // Redirect after successful deletion
        })
        .catch(err => {
            console.error(err);
            res.redirect('/manage_users.handlebars'); // Redirect back to home page on error
        });
});

server.post('/deleteResto', function(req, res) {
    const restoId = req.body.restoId; // Assuming restoId is sent in the request body

    // Find the kitchen by its ID and delete it
    kitchenModel.findByIdAndDelete(restoId)
        .then(deletedKitchen => {
            if (!deletedKitchen) {
                // Handle case where the kitchen with the given ID does not exist
                console.error('Kitchen not found:', restoId);
                return res.redirect('/manage_resto.handlebars'); // Redirect back to manage_resto page
            }
            // Delete all posts associated with the deleted kitchen's restaurantName
            return postModel.deleteMany({ restaurantName: deletedKitchen.restaurantName });
        })
        .then(() => {
            // Redirect after successful deletion
            res.redirect('/manage_resto.handlebars');
        })
        .catch(err => {
            console.error(err);
            // Redirect back to manage_resto page on error
            res.redirect('/manage_resto.handlebars');
        });
});

//gets the Object id of the post the user wants to edit
server.get('/getPost/:postId', function(req, res) {
    const postId = req.params.postId;
    postModel.findById(postId)
        .then(post => {
            res.json(post);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching post');
        });
});

// POST route to update a post
server.post('/updatePost', function(req, res) {
    const postId = req.body.postId; // Get the post ID from the request body
    const { rating, description } = req.body; // Get the updated rating and description from the request body
    const userId = req.session.user ? req.session.user._id : null; // Get user's _id from session

    // Find the post by postId
    postModel.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).send('Post not found');
            }
            // Check if the user is the author of the post
            if (post.userId.toString() !== userId) {
                return res.status(403).send('You are not authorized to update this post');
            }
            // If user is authorized, proceed to update the post
            postModel.findByIdAndUpdate(postId, { rating, description }, { new: true })
                .then(updatedPost => {
                    if (updatedPost) {
                        res.redirect('/Home_page.handlebars'); // Redirect after successful update
                    } else {
                        res.redirect('/Home_page.handlebars'); // Redirect back to home page if no post found
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.redirect('/Home_page.handlebars'); // Redirect back to home page on error
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});


server.get('/getProfile/:userId', function(req, res) {
    const userId= req.params.userId;
    userModel.findById(userId)
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching profile');
        });
});

server.post('/updateProfile', async function(req, res) {
    const userId = req.session.user ? req.session.user._id : null;
    const { username, email, imageSrc, bio, postId } = req.body; // Include postId in the request body

    try {
        const updatedUser = await userModel.findByIdAndUpdate(userId, { username, email, imageSrc, bio }, { new: true });

        if (!updatedUser) {
            return res.redirect('/User_Profile.handlebars');
        }

        // Update session data with the updated user information FIRST
        req.session.user = {
            ...req.session.user,
            username: updatedUser.username,
            email: updatedUser.email,
            imageSrc: updatedUser.imageSrc,
            bio: updatedUser.bio
        };

        // Update all posts authored by this user AFTER updating session data
        await postModel.updateMany(
            { userId: userId }, // Use userId here to update posts for the current user
            { $set: { username: updatedUser.username, imageSrc: updatedUser.imageSrc }}
        );

        res.redirect('/User_Profile.handlebars');
    } catch (error) {
        console.error(error);
        res.redirect('/User_Profile.handlebars');
    }
});

server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'Login Page',
    });
});

server.get('/Registration_page.handlebars', function(req, resp) {
    resp.render('Registration_page',{
        layout: 'index',
        title: 'Registration Page',
    });
});

server.get('/admin_login.handlebars', function(req, resp) {
    resp.render('admin_login',{
        layout: 'index',
        title: 'Admin Login Page',
    });
});

server.get('/admin_page.handlebars', function(req, resp) {
    resp.render('admin_page',{
        layout: 'admin_index', 
        title: 'Admin Page',
    });
});

server.get('/manage_resto.handlebars', function(req, resp) {
    kitchenModel.find({}).lean().then(function(kitchens) {
    resp.render('manage_resto',{
        layout: 'admin_index',
        title: 'Manage Resto',
        kitchens: kitchens
       });
    });
});

server.get('/manage_users.handlebars', function(req, resp) {
    userModel.find({}).lean().then(function(users) {
    resp.render('manage_users',{
        layout: 'admin_index',
        title: 'Manage Users',
        users: users
        });
    });
});

server.get('/manage_posts.handlebars', function(req, resp) {
    postModel.find({}).lean().then(function(posts) {
    resp.render('manage_posts',{
        layout: 'admin_index',
        title: 'Manage Posts',
        posts: posts
        });
    });
});

function countPostsByRestaurant(posts){
    const restaurantCount = {};
  
    posts.forEach(post => {
        const restaurantName = post.restaurantName;
  
        restaurantCount[restaurantName] = (restaurantCount[restaurantName] || 0) + 1;
    });
    return restaurantCount;
  }

server.get('/admin_page.handlebars', function(req, res) {
    res.render('admin_page'); 
});

server.get('/Home_page.handlebars', function(req, resp) {
    const userId = req.session.user ? req.session.user._id : null;
    const username = req.session.user ? req.session.user.username : null;
    const imageSrc = req.session.user ? req.session.user.imageSrc : null;
    // Retrieve data from the 'posts' collection
    postModel.find({}).lean().then(function(posts) {
        const restaurantCounter = countPostsByRestaurant(posts);
        // Retrieve data from the 'kitchens' collection
        kitchenModel.find({}).lean().then(function(kitchens) {
                resp.render('Home_page', {
                    layout: 'index',
                    title: 'Home Page',
                    posts: posts,
                    kitchen: kitchens,
                    userId: userId,
                    username: username,
                    imageSrc: imageSrc,
                    restaurantCounter: restaurantCounter
                });
        }).catch(errorFn);
    }).catch(errorFn);
});

server.get('/User_Profile.handlebars', function(req, resp) {
    const username = req.session.user ? req.session.user.username : null;
    const email = req.session.user ? req.session.user.email : null;
    const imageSrc = req.session.user ? req.session.user.imageSrc : null;
    const bio = req.session.user ? req.session.user.bio : null;
    const numOfRev = req.session.user ? req.session.user.numOfRev : null;
    const numOfKitch = req.session.user ? req.session.user.numOfKitch : null;
    // Retrieve data from the 'users' collection
    userModel.find({}).lean().then(function(users) {
        // Render the 'User_Profile' view and pass the retrieved data to it
        resp.render('User_Profile', {
            layout: 'index',
            title: 'User Profile',
            users: users,
            username: username,
            email: email,
            imageSrc: imageSrc,
            bio: bio,
            numOfRev: numOfRev,
            numOfKitch: numOfKitch
        });
    }).catch(errorFn);
});

function finalClose(){
    console.log('Close connection at the end!');
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM',finalClose);
process.on('SIGINT',finalClose);
process.on('SIGQUIT', finalClose);

const port = process.env.PORT | 3000;
server.listen(port, function(){
    console.log('Listening at port' + port);
});