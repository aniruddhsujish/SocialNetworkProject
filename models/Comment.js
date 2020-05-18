//add this line in any file that need mongoose
var mongoose = require('mongoose');

//create a separate namespace to avoid using an default variable of the library
module.exports = mongoose.model('Comment',{
   postID: String, //ID of the post the comment belongs to
   username: String, //username of person who commented
   dateCommented: String, //date the comment was made
   content: String //the content of the comment
});