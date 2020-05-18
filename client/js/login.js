  /*global $*/
  function handleLoginAttempt(){
    event.preventDefault();
      var container = document.getElementById('form');
      var inputs = container.getElementsByTagName('input');
      var emptyInputs = 0;
      var mismatchPassword = 0;
      
      // Check if there's empty inputs
      for (var index = 0; index < inputs.length; ++index) {
          emptyInputs = inputs[index].value.length == 0 ? emptyInputs++ : emptyInputs; 
      }
      
      if(inputs.length > 2){
        mismatchPassword = inputs[1].value == inputs[2].value ? 0 : 1;
      }
    
      if (emptyInputs == 0 && mismatchPassword == 0){
          Promise.resolve()
          .then(function(){
              
              return $.post($('form').data('formtype'), 'username=' + inputs[0].value + '&password=' + inputs[1].value);
          })
          .then(function(auth){
              if (auth.isValid){
                  $('#error').text = '';
                  window.location.replace($('form').data('location'));
              } else {
                  $('#error').html(auth.message);
                  $('input').html('');
              }
          })
          .catch(function(err){
              console.log(err);
          })
      } else {
          $('#error').html('Please provide both username and password');
      }
  }
