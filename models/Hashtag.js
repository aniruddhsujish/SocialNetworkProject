//add this line in any file that need mongoose
var mongoose = require('mongoose');

//create a separate namespace to avoid using an default variable of the library
module.exports = mongoose.model('Hashtag',{
   postID: String, //ID of the post the comment belongs to
   tag: String //the tag itself
});