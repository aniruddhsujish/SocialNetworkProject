//add this line in any file that need mongoose
var mongoose = require('mongoose');

//create a separate namespace to avoid using an default variable of the library
module.exports = mongoose.model('User',
{
   username: String, //name of the account
   password: String, //password of the account
   email: String, //name of the account
   profilePicture: String //account profilepicture's URL
});