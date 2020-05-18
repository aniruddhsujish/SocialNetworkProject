

function onLoad(){

	Promise.resolve()
	.then(function(){
		return $.post('GetDetails');
	})
	.then(function(userInfo){
		var user = userInfo[0]
		$('#info-container').prepend(
			'<a href="" class="">' +
            '<img src="'+ user.profilePicture +'" class="profile-image"></img>' +
            '</a>' +
            '<div>' +
            '<a class="profile-name" href="">' + user.username + '</a>'+
            '</div>' +
            '<div>' +
            '<a class="profile-info" href="">' + user.email + '</a>'+
            '</div>'
			
		);

		Promise.resolve()
		.then(function(){
			return $.post('GetUserPosts');
		})
		.then(function(posts){
			posts.forEach(function(post){
            Promise.resolve()
            .then(function(posts){
        
              var feedBlockTemplate = "";
              var likesText = (post.likeCount > 1)? "likes": "like";
              
              $('#profile-container').prepend(
                '<div class="feed-block" data-postId="' + post._id + '">' +
                '  <div class="feed-header">' +
                '    <a href="" class="feed-time">' +
                '      <time>' + post.datePosted + '</time>' +
                '    </a>' +
                '  </div>' +
                '  <a href="" class="feed-image">' +
                '    <img src="'+ post.imageURL +'" class="img-responsive" alt="">' +
                '  </a>' +
                '  <div class="feed-body">' +
                '    <p href="" class="likes"><span id ="like' + post._id + '">'+ post.likeCount +'</span> '+ likesText +'</p>' +
                '    <ul class="comment-list">' +
                '      <li>' +
                '        <a class="feed-user" href="">' +
                '          {username}' +
                '        </a>' + post.caption +'</li></ul>' +
                '    <div class="add-comment">' +
                '      <a class="fa fa-heart-o like-photo" onclick="likeClick(\'' + post._id + '\');"></a>' +
                '      <a class="fa fa-comment like-photo" onclick="commentClick(\''+ post._id + '\');"></a>'+
                '      <form id="commentform'+post._id+'" class="add-comment-form">' +
                '        <input type="text" placeholder="Add a comment..." class="add-comment-input" name=""/>' +
                '      </form>' +
                '    </div>' +
                '  </div>' +
                '</div>' 
              );
              
              Promise.resolve()
              .then(function(){
                return($.post('GetUserDetails',{id : post.userID}));
              })
              .then(function(userInfo){
                  var user = userInfo[0];
                  $("[data-postid='" + post._id + "']").find(".feed-user").text(user.username);
                  $("[data-postid='" + post._id + "']").find(".feed-header").prepend(
                      '<a href="" class="feed-avatar">' +
                      '      <img src="'+ user.profilePicture +'" class="feed-avatar-image small"></img>' +
                      '    </a>' +
                      '    <div class="feed-info">' +
                      '      <a class="feed-user" href="">' + user.username + '</a></div>'
                  );
              })
              .then(function(){
                return ($.post('GetAllComments',{id : post._id}));
              })
              .then(function(comments){
                comments.forEach(function(entry){
                   console.log(entry); 
                   $("[data-postid='" + post._id + "']").find(".comment-list").append(
                    '      <li>' +
                    '        <a class="feed-user" href="">' + entry.username + '</a>'+
                             entry.content + '</li></ul>'
                   );
                });
              })
              /*.then(function(){
                  return ($.post('GetAllHashtag',{id : post._id}));
              })
              .then(function(hashtags){
                $("[data-postid='" + post._id + "']").find(".comment-list li:first-child").append(
                  '      <li class="comment-hashtags">' +
                  '        <a class="feed-user" href="">' + $(".feed-block:last-child .comment-list li:first-child .feed-user").text() + '</a>'+
                  '</li></ul>'
                 );
                hashtags.forEach(function(hashtag){
                  console.log(hashtag); 
                  $(".feed-block:last-child .comment-hashtags").append(
                    '<a class="hashtag">#' +hashtag.tag  + '</a>'
                  ); 
                });
              })*/
              .catch(function(err){
                //always include a catch for exceptions
                console.log(err);
              });
            })
            .catch(function(err){
              //always include a catch for exceptions
              console.log(err);
            });
        });
		})
	})
	.catch(function(err){
		console.log(err);
	});
}

function likeClick(id){
    event.preventDefault();
    console.log('liked')
    Promise.resolve()
    .then(function(){
        //jQuery provides a nice convenience method for easily sending a post with parameters in JSON
        //here we pass the ID to the incrLike route on the server side so it can do the incrementing for us
        //note the return. This MUST be here, or the subsequent then will not wait for this to complete
        return $.post('incrLike', {id : id});
    })
    .then(function(like){
        //jQuery provides a nice convenience methot for easily setting the count to the value returned
       if(like.count != -1){
         document.getElementById('like' + like.id).innerHTML = like.count
       } else {
         alert("You liked this post already.");
       }
       
       
    })
    .catch(function(err){
        //always include a catch for the promise chain
        console.log(err);
    });
}

function commentClick(id){
	event.preventDefault();
	console.log('comment');
	var comment = document.getElementById('commentform'+id);
	var input = comment.getElementsByTagName('input');
	Promise.resolve()
	.then(function(){
		return $.post('uploadComment',{id:id,comment:input[0].value})
	}).then(function(){
		window.location.reload();
	})
}



function updateNameClick(){
	event.preventDefault();
	console.log('updatename');
	var name = document.getElementById('uploadForm2');
	var newName = name.getElementsByTagName('input');
	Promise.resolve()
	.then(function(){
		return $.post('updateName',{name:newName[0].value})
	}).then(function(){
		window.location.reload();
	})
}


function uploadClick(){
    //go get the data from the form
    var form = new FormData($("#uploadForm")[0]);
    //we can post this way as well as $.post
    $.ajax({
            url: '/upload',
            method: "POST",
            dataType: 'json',
            //the form object is the data
            data: form,
            //we want to send it untouched, so this needs to be false
            processData: false,
            contentType: false,
            //add a message 
            success: function(result){
              setTimeout(function(){
                window.location.reload(true);
              },1000);
            },
            error: function(er){}
    });            
}

function uploadProfileClick(){
    //go get the data from the form
    var form = new FormData($("#uploadForm1")[0]);
    //we can post this way as well as $.post
    $.ajax({
            url: '/uploadProfile',
            method: "POST",
            dataType: 'json',
            //the form object is the data
            data: form,
            //we want to send it untouched, so this needs to be false
            processData: false,
            contentType: false,
            //add a message 
            success: function(result){
              setTimeout(function(){
                window.location.reload(true);
              },1000);
            },
            error: function(er){}
    });            
}

