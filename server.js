/* global Data*/
//require statements
var http = require('http');
var path = require('path');

//express related
var express = require('express');
const bodyParser = require('body-parser');
const Guid = require('guid');
const fileUpload = require('express-fileupload');

//session
const session = require('express-session');  
const mongoSession = require('connect-mongodb-session')(session);
const passport = require('passport');
const userAuth = require('./userAuth.js');
const hash = require('./utils/hash.js');

//database
var mongoose = require('mongoose');
var Post = require('./models/Post.js');
var Comment = require('./models/Comment.js');
var Hashtag = require('./models/Hashtag.js');
var User = require('./models/User.js');
var Like = require('./models/Like.js');
var PasswordReset = require('./models/PasswordReset.js');

//sendmail
const email = require('./utils/sendmail.js');

var router = express();
var server = http.createServer(router);

//const dbUrl = 'mongodb://Aniruddh:<password>@freecluster-shard-00-00-k5dgb.mongodb.net:27017,freecluster-shard-00-01-k5dgb.mongodb.net:27017,freecluster-shard-00-02-k5dgb.mongodb.net:27017/test?ssl=true&replicaSet=FreeCluster-shard-0&authSource=admin&retryWrites=true&w=majority'
const dbUrl = 'mongodb://testuser:testuser@freecluster-shard-00-00-k5dgb.mongodb.net:27017,freecluster-shard-00-01-k5dgb.mongodb.net:27017,freecluster-shard-00-02-k5dgb.mongodb.net:27017/aloha?ssl=true&replicaSet=FreeCluster-shard-0&authSource=admin&retryWrites=true&w=majority'


//establish connection to our mongodb instance
mongoose.connect(dbUrl);
mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected!!!');
});
//create a sessions collection as well
var mongoSessionStore = new mongoSession({
    uri: dbUrl,
    collection: 'sessions'
});

router.use(fileUpload());

//tell the router (ie. express) where to find static files
router.use(express.static(path.resolve(__dirname, 'client')));

//tell the router to parse JSON data for us and put it into req.body
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//add session support
router.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey', 
  store: mongoSessionStore,
  resave: true,
  saveUninitialized: false
}));

//add passport for authentication support
router.use(passport.initialize());
router.use(passport.session());
userAuth.init(passport);

//request ROOT
router.get('/', function(req, res)
{
  console.log('client requests root');
  //use sendfile to send our signin.html file
  res.sendfile(path.join(__dirname, 'client','signin.html'));
});

//request LOGIN
router.get('/login', function(req, res)
{
  console.log('client requests login');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client','login.html'));
});

//request PROFILE
router.get('/profile',function(req,res)
{
  console.log('client requests profile');
  res.sendfile(path.join(__dirname,'client','profile.html'));
});

//submit LOGIN
router.post('/login', function(req, res, next) 
{
  //tell passport to attempt to authenticate the login
  passport.authenticate('login', function(err, user, info)
  {
    //callback returns here
    if (err)
    {
      //if error, say error
      res.json({isValid: false, message: 'internal error'});
    } 
    else if (!user) 
    {
      //if no user, say invalid login
      res.json({isValid: false, message: 'try again'});
    } 
    else 
    {
      //log this user in
      req.logIn(user, function(err)
      {
        if (!err)
          //send a message to the client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

//request JOIN
router.get('/join', function(req, res)
{
  console.log('client requests join');
  res.sendFile(path.join(__dirname, 'client', 'signin.html'));//EDIT THIS 
});

//submit JOIN
router.post('/join', function(req, res, next) 
{
  passport.authenticate('join', function(err, user, info)
  {
    if (err)
    {
      res.json({isValid: false, message: 'internal error'});    
    } 
    else if (!user)
    {
      res.json({isValid: false, message: 'try again'});
    }
    else 
    {
      //log this user in since they've just joined
      req.logIn(user, function(err)
      {
        if (!err)
          //send a message to the client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

//request PASSWORD RESET
router.get('/passwordreset', function(req, res)
{
  console.log('client requests passwordreset');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client','passwordreset.html'));
});

//submit PASSWORD RESET
router.post('/passwordreset',function(req, res)
{
    Promise.resolve()
    .then(function()
    {
        //see if there's a user with this email
        return User.findOne({'email' : req.body.email});
    })
    .then(function(user)
    {
      if (user)
      {
        var pr = new PasswordReset();
        pr.userID = user.id;
        pr.password = hash.createHash(req.body.password);
        pr.expires = new Date((new Date()).getTime() + (20 * 60 * 1000));
        pr.save()
        
        .then(function(pr)
        {
          if (pr)
          {
            email.send(req.body.email, 'Reset your password at Aloha', pr.id);
            res.redirect('/login');
          }
        });
      }
    })
    
});

//request VERIFY PASSWORD
router.get('/verifypassword', function(req, res)
{
    var password;
    
    Promise.resolve()
    .then(function()
    {
      return PasswordReset.findOne({id: req.body.id});
    })
    .then(function(pr)
    {
      if (pr)
      {
        //if (pr.expires > new Date())
        //{
          password = pr.password;
          //see if there's a user with this email
          return User.findById({_id:pr.userID});
        //}
      }
    })
    .then(function(user)
    {
      if (user)
      {
        user.password = password;
        user.save();
        console.log("Changed password for " + user.email +" new password is "+ user.password);
        res.redirect('/login');
      }
    })
  res.redirect('/login');
});

//request POST page
router.get('/posts',userAuth.isAuthenticated, function(req, res)
{
  console.log('client requests posts');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client','posts.html'),{ username: req.user.username });
});

//request ALL POST
router.post('/GetAllPosts', function(req, res)
{
  //print the log
  console.log('Client requests all posts');
  
  //go find all the posts in the database
  Post.find({})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
  },function(error){
    console.log('Couldnt load images');
    res.status('404').end();
  })
});

//get all POSTS of user
router.post('/GetUserPosts',function(req,res)
{
  console.log('Client requests user posts');

  Post.find({userID:req.user.id})
  .then(function(paths){
    res.json(paths);
  })
})

//add a COMMENT to a post
router.post('/uploadComment',function(req,res){
  console.log('Adding comment to post' + req.body.id);
  Post.findById(req.body.id)
  .then(function(post){
    post.commentCount++;
    return post.save(post);
  })
  .then(function(post){
    var temporaryData = new Date();
    var comment = new Comment();
    comment.postID = req.body.id;
    comment.username = req.user.username;
    comment.dateCommented = temporaryData.toDateString();
    comment.content = req.body.comment;
    comment.save()
    .then(function()
    {
      res.json({success: true, message: 'all good'});            
    });
  });
  
});
  
//request ALL COMMENT of a post
router.post('/GetAllComments', function(req, res)
{
  //print the log
  console.log('Find all comments of post ' + req.body.id);
  var commentArray = {};

  Post.findById(req.body.id)
  .then(function(post){
    if(post.commentCount>0){
      Comment.find({postID:req.body.id})
      .then(function(paths){
        paths.forEach(function(comment) {
        //send them to the client in JSON format
        res.json(paths);
        });
      });
    }else{
      res.end();
    }
  })
});
  


//request DETAIL of an user
router.post('/GetUserDetails', function(req, res)
{
  //print the log
  console.log('Get details of the user that has id ' + req.body.id);
  //go find all the details of the user
  User.find({_id:req.body.id})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
    });
});


//request to get DETAILS of current user
router.post('/GetDetails',function(req,res){
  console.log('Get deails of current user ');
  User.find({_id:req.user.id})
  .then(function(paths){
    res.json(paths);
  });
})

//request to INCREMENT LIKE
router.post('/incrLike', userAuth.isAuthenticated, function(req, res)
{
  console.log('increment like for ' + req.body.id + ' by user ' + req.user.email);

  Like.findOne({userId: req.user.id, postId: req.body.id})
  .then(function(like)
  {
    if (!like)
    {
      //go get the post record
      Post.findById(req.body.id)
      .then(function(post)
      {
        //increment the like count
        post.likeCount++;
        //save the record back to the database
        return post.save(post);
      })
      .then(function(post)
      {
        var like = new Like();
        like.userId = req.user.id;
        like.postId = req.body.id;
        like.save();
        
        //a successful save returns back the updated object
        res.json({id: req.body.id, count: post.likeCount});  
      })
    } 
    else 
    {
        res.json({id: req.body.id, count: -1});  
    }
  })
  .catch(function(err)
  {
    console.log(err);
  })
});

//request to change USERNAME
router.post('/updateName',userAuth.isAuthenticated,function(req,res){
  console.log('updating username '+ req.body.name);
  User.findById(req.user.id)
  .then(function(user){
    user.username = req.body.name;
    user.save(user)
    .then(function()
          {
            res.json({success: true, message: 'all good'});            
          });
  })
})


//request to UPLOAD
router.post('/upload', userAuth.isAuthenticated, function(req, res) 
{
  var response = {success: false, message: ''};
  
  if (req.files)
  {
    // The name of the input field is used to retrieve the uploaded file 
    var userPhoto = req.files.userPhoto;
    //invent a unique file name so no conflicts with any other files
    var guid = Guid.create();
    //figure out what extension to apply to the file
    var extension = '';
    
    switch(userPhoto.mimetype)
    {
      case 'image/jpeg':
        extension = '.jpg';
        break;
      case 'image/png':
        extension = '.png';
        break;
      case 'image/bmp':
        extension = '.bmp';
        break;
      case 'image/gif':
        extension = '.gif';
        break;
    }
    
    //if we have an extension, it is a file type we will accept
    if (extension)
    {
      //construct the file name
      var filename = guid + extension;
      // Use the mv() method to place the file somewhere on your server 
      var temporaryData = new Date();
      
      userPhoto.mv('./client/img/' + filename, function(err) 
      {
        //if no error
        if (!err)
        {
          //create a post for this image
          var post = new Post();
          post.userID = req.user.id;
          post.imageURL = './img/' + filename;
          post.likeCount = 0;
          post.commentCount = 0;
          post.feedbackCount = 0;
          post.caption='This is new image';
          post.datePosted= temporaryData.toDateString();
          
          //save it
          post.save()
          
          .then(function()
          {
            res.json({success: true, message: 'all good'});            
          })
        } 
        else 
        {
          response.message = 'internal error';
          res.json(response);
        }
      });
    } 
    else 
    {
      response.message = 'unsupported file type';
      res.json(response);
    }
  } 
  else 
  {
    response.message = 'no files';
    res.json(response);
  }
});


router.post('/uploadProfile', userAuth.isAuthenticated, function(req, res) 
{
  var response = {success: false, message: ''};
  console.log("Upload new profile pic");
  
  if (req.files)
  {
    // The name of the input field is used to retrieve the uploaded file 
    var userPhoto = req.files.userPhoto;
    //invent a unique file name so no conflicts with any other files
    var guid = Guid.create();
    //figure out what extension to apply to the file
    var extension = '';
    switch(userPhoto.mimetype)
    {
      case 'image/jpeg':
        extension = '.jpg';
        break;
      case 'image/png':
        extension = '.png';
        break;
      case 'image/bmp':
        extension = '.bmp';
        break;
      case 'image/gif':
        extension = '.gif';
        break;
    }
    
    //if we have an extension, it is a file type we will accept
    if (extension)
    {
      //construct the file name
      var filename = guid + extension;
      // Use the mv() method to place the file somewhere on your server 
      var temporaryData = new Date();
      
      userPhoto.mv('./client/dp/' + filename, function(err) 
      {
        //if no error
        if (!err)
        {
          User.findById(req.user.id)
          .then(function(user){
            user.profilePicture = './dp/' + filename;
            user.save(user)
            .then(function(){
              res.json({success: true, message: 'all good'});
            });
          });
        } 
        else 
        {
          response.message = 'internal error';
          res.json(response);
        }
      });
    } 
    else 
    {
      response.message = 'unsupported file type';
      res.json(response);
    }
  } 
  else 
  {
    response.message = 'no files';
    res.json(response);
  }
});
server.listen(process.env.PORT || 3900,process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});