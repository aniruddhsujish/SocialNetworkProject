//add this line in any file that need mongoose
var mongoose = require('mongoose');

//create a separate namespace to avoid using an default variable of the library
module.exports = mongoose.model('Follow',{
   followID: String, //ID of the following
   followingID: String, //ID of the user being followed
   status: Number, //status of the follow request
});