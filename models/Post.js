//add this line in any file that need mongoose
var mongoose = require('mongoose');

//create a separate namespace to avoid using an default variable of the library
module.exports = mongoose.model('Post',{
   imageURL: String, //url to img
   caption: String, //caption of the image
   datePosted: String, //date the post was made
   likeCount: Number, //number of like (convenience value)
   commentCount:Number, //number of feedback (convenience value)
   userID:String //ID of user posted the post
});