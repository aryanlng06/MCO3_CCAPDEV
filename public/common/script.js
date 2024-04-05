$(document).ready(function() {
    // Function to show the pop-up form
    $(".revButton").click(function() {
      $(".popup").show(1000);
  
    });
  
    
    $('.edit-Btn').on('click', function() {
      // Get the postId from the data-post-id attribute
      const postId = $(this).data('post-id');
      // Set the postId value in the hidden input field of the update review form
      $('#update-post-id').val(postId);
      // Show the update review popup
      $('#update-review-popup').show(1000);
    });


    $('.revButton').on('click', function() {
      // Get the postId from the data-post-id attribute
      const profileId = $(this).data('profile-id');
      // Set the postId value in the hidden input field of the update review form
      $('#update-profile-id').val(profileId);
      // Show the update review popup
      $('#update-profile-popup').show(1000);
    });

    $(".addRest").click(function() {
      $(".popup_addRest").show(1000);
  
    });    

    // Function to hide the pop-up form when the close button is clicked
    $(".close").click(function() {
      $(".popup").hide(1000);
    });

    $('.popup_update .close').on('click', function() {
      $('#update-review-popup').hide(1000);
  });

    $(".close").click(function() {
      $(".popup_addRest").hide(1000);
    });
  });
  
  // Function to submit the form when the close button is clicked
  $("#submit").click(function() {
    $(".popup").css("display", "none");
  });

  
  function checkForm(){
  var username = document.forms["reg-form"]["username"].value;
	var email = document.forms["reg-form"]["email"].value;
	var pass1 = document.forms["reg-form"]["password1"].value;
	var pass2 = document.forms["reg-form"]["password2"].value;

  if(pass1!=pass2){
		alert("passwords do not match!");
		return false;
	}
	return true;
  }

  function checkPost(){
    var restoName = document.forms["post-form"]["restaurantName"].value;
    var restoLocation = document.forms["post-form"]["location"].value;
    var restoRate = document.forms["post-form"]["rating"].value;
    var resDesc = document.forms["post-form"]["description"].value;
    if(restoName.length<1){
      alert("Please Identify Restaurant Name!");
      return false;
    }else if(restoLocation.length<1){
      alert("Please include Restaurant Location!");
      return false;
    }else if(restoRate.length<1){
      alert("Please Rate the kitchen!");
      return false;
    }
    else if(resDesc.length<1){
      alert("You can't have a blank Donkey!");
      return false;
    }
    return true;
  }

// Add an event listener to handle delete button click
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('del-Btn')) {
      const postId = event.target.getAttribute('data-post-id');
      deletePost(postId);
  }
});

// Define a function to delete a post
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
      // Send an AJAX request to delete the post
      fetch('/deletePost', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId: postId})
      })
      .then(response => {
          if (response.ok) {
              // Reload the page after successful deletion
              window.location.reload();
          } else {
              console.error('Failed to delete post');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
}

document.addEventListener('click', function(event) {
  if (event.target.classList.contains('del-post-admin')) {
      const postId = event.target.getAttribute('data-post-id');
      deletePost(postId);
  }
});

// Define a function to delete a post
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
      // Send an AJAX request to delete the post
      fetch('/deletePostAdmin', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId: postId })
      })
      .then(response => {
          if (response.ok) {
              // Reload the page after successful deletion
              window.location.reload();
          } else {
              console.error('Failed to delete post');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
}

document.addEventListener('click', function(event) {
  if (event.target.classList.contains('del-Btn-admin')) {
      const restoId = event.target.getAttribute('data-resto-id');
      deleteResto(restoId);
  }
});

// Define a function to delete a post
function deleteResto(restoId) {
  if (confirm("Are you sure you want to delete this resto?")) {
      // Send an AJAX request to delete the post
      fetch('/deleteResto', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ restoId: restoId })
      })
      .then(response => {
          if (response.ok) {
              // Reload the page after successful deletion
              window.location.reload();
          } else {
              console.error('Failed to delete post');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
}

document.addEventListener('click', function(event) {
  if (event.target.classList.contains('del-user-admin')) {
      const userId = event.target.getAttribute('data-user-id');
      deleteUser(userId);
  }
});

// Define a function to delete a post
function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
      // Send an AJAX request to delete the post
      fetch('/deleteUserAdmin', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: userId })
      })
      .then(response => {
          if (response.ok) {
              // Reload the page after successful deletion
              window.location.reload();
          } else {
              console.error('Failed to delete post');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
}

// Add an event listener to handle edit button click
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-Btn')) {
        const postId = event.target.getAttribute('data-post-id');
        populateEditForm(postId);
    }
});

// Function to populate the edit form with current post data
function populateEditForm(postId) {
    // Fetch the post data from the server using AJAX
    fetch(`/getPost/${postId}`)
        .then(response => response.json())
        .then(post => {
            // Populate the edit form fields with current post data
            document.querySelector('.rating').value = post.rating;
            document.querySelector('.description').value = post.description;

            // Show the edit popup
            document.querySelector('.popup_update').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

// Event listener to handle edit button click
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('revButton')) {
    const userId = event.target.getAttribute('data-user-id');
    populateProfileEditForm(userId);
  }
});

// Function to populate the edit form with current user data
function populateProfileEditForm(userId) {
  // Set the userId attribute in the form
  document.getElementById('data-user-id').value = userId;

  // Fetch the user data from the server using AJAX
  fetch(`/getProfile/${userId}`)
    .then(response => response.json())
    .then(user => {
      // Populate the edit form fields with current user data
      document.querySelector('.imageSrc').value = user.imageSrc;
      document.querySelector('.bio').value = user.bio;

      // Show the edit popup
      document.querySelector('.edit_profile').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
}

$(document).ready(function() {
  $('#searchInput').on('input', function() {
      var searchText = $(this).val().toLowerCase(); // Get the input value and convert to lowercase for case-insensitive search
      $('.home-post-holder').each(function() {
          var restaurantName = $(this).find('.restaurantname h2').text().toLowerCase(); // Get the restaurant name of each post
          if (restaurantName.includes(searchText)) {
              $(this).show(); // Show the post if the restaurant name matches the search text
          } else {
              $(this).hide(); // Hide the post if the restaurant name does not match the search text
          }
      });
  });
});


$(document).ready(function() {
  // Add event listener for like button clicks
  $(document).on('click', '.like-button', function() {
      // Get the post ID associated with the button
      const postId = $(this).data('post-id');
      
      // Toggle the 'helpful' class to change the button color
      $(this).toggleClass('helpful');

      // Save the state of the button to localStorage
      const isHelpful = $(this).hasClass('helpful');
      localStorage.setItem(`buttonState_${postId}`, isHelpful ? 'helpful' : '');
  });

  // Restore button states from local storage on page load
  $(".like-button").each(function() {
      const postId = $(this).data('post-id');
      const isHelpful = localStorage.getItem(`buttonState_${postId}`);
      if (isHelpful === 'helpful') {
          $(this).addClass('helpful');
      }
  });
});